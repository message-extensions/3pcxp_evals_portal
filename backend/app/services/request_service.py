"""Request service for business logic and CRUD operations."""
from typing import List, Optional
from datetime import datetime, timezone
import secrets
from app.models.request import (
    Request, RequestCreate, RequestUpdate, 
    StartEvaluation, AddRunLinks, RunLink, Priority
)
from app.models.user import User
from app.storage.json_storage import JSONStorage
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RequestService:
    """Business logic for evaluation requests."""
    
    def __init__(self):
        self.storage = JSONStorage(data_dir=settings.data_dir)
    
    def _generate_id(self) -> str:
        """Generate unique request ID."""
        timestamp = int(datetime.now(timezone.utc).timestamp())
        random_suffix = secrets.token_hex(6)
        return f"req_{timestamp}_{random_suffix}"
    
    async def create_request(self, request_data: RequestCreate, submitter: User) -> Request:
        """Create new evaluation request."""
        request_id = self._generate_id()
        
        # Create request with auto-populated fields
        request = Request(
            id=request_id,
            purpose=request_data.purpose,
            purpose_reason=request_data.purpose_reason,
            agent_type=request_data.agent_type,
            agents=request_data.agents,
            query_set=request_data.query_set,
            query_set_details=request_data.query_set_details,
            control_config=request_data.control_config,
            treatment_config=request_data.treatment_config,
            notes=request_data.notes,
            priority=request_data.priority,
            on_behalf_of=request_data.on_behalf_of,
            submitter=submitter.name,
            submitted_at=datetime.now(timezone.utc),
            status="pending",
            run_links=[]
        )
        
        # Save to storage
        await self.storage.save_request(request)
        logger.info(f"Created request {request_id} by {submitter.name}")
        
        return request
    
    async def get_request(self, request_id: str) -> Optional[Request]:
        """Get request by ID."""
        return await self.storage.get_request(request_id)
    
    async def list_requests(self, status: Optional[str] = None, sort_by_priority: bool = True) -> List[Request]:
        """List all requests, optionally filtered by status and sorted by priority."""
        if status:
            requests = await self.storage.get_requests_by_status(status)
        else:
            requests = await self.storage.list_all_requests()
        
        # Sort by priority (High -> Medium -> Low) then by submitted_at (newest first)
        if sort_by_priority:
            priority_order = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
            requests.sort(
                key=lambda r: (
                    priority_order.get(r.priority, 1),  # Priority first
                    -r.submitted_at.timestamp()  # Then by time (descending)
                )
            )
        
        return requests
    
    async def update_request(
        self, 
        request_id: str, 
        update_data: RequestUpdate,
        user: User
    ) -> Optional[Request]:
        """Update existing request."""
        # Get existing request
        request = await self.storage.get_request(request_id)
        if not request:
            return None
        
        # Update fields (only non-None values)
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_request = request.model_copy(update=update_dict)
        
        # Save updated request
        await self.storage.save_request(updated_request)
        logger.info(f"Updated request {request_id} by {user.name}")
        
        return updated_request
    
    async def start_evaluation(
        self, 
        request_id: str, 
        start_data: StartEvaluation,
        executor: User
    ) -> Optional[Request]:
        """Start evaluation (move to in_progress status)."""
        # Get existing request
        request = await self.storage.get_request(request_id)
        if not request:
            return None
        
        # Validate status transition
        if request.status != "pending":
            raise ValueError(f"Cannot start request with status '{request.status}'")
        
        # Update added_at timestamp for run links
        run_links = [
            link.model_copy(update={"added_at": datetime.now(timezone.utc)})
            for link in start_data.run_links
        ]
        
        # Update request
        updated_request = request.model_copy(update={
            "status": "in_progress",
            "executor": executor.name,
            "started_at": datetime.now(timezone.utc),
            "run_links": run_links
        })
        
        # Save updated request
        await self.storage.save_request(updated_request)
        logger.info(f"Started evaluation {request_id} by {executor.name}")
        
        return updated_request
    
    async def add_run_links(
        self, 
        request_id: str, 
        links_data: AddRunLinks,
        user: User
    ) -> Optional[Request]:
        """Add run links to in-progress or completed evaluation."""
        # Get existing request
        request = await self.storage.get_request(request_id)
        if not request:
            return None
        
        # Validate status - allow both in_progress and completed
        if request.status not in ["in_progress", "completed"]:
            raise ValueError(f"Cannot add links to request with status '{request.status}'")
        
        # Update added_at timestamp for new links
        new_links = [
            link.model_copy(update={"added_at": datetime.now(timezone.utc)})
            for link in links_data.run_links
        ]
        
        updated_links = list(request.run_links) + new_links
        
        # Check max links limit (10)
        if len(updated_links) > 10:
            raise ValueError("Maximum 10 run links allowed per evaluation")
        
        # Update request
        updated_request = request.model_copy(update={"run_links": updated_links})
        
        # Save updated request
        await self.storage.save_request(updated_request)
        logger.info(f"Added {len(new_links)} run links to {request_id} by {user.name}")
        
        return updated_request
    
    async def complete_evaluation(
        self, 
        request_id: str,
        user: User
    ) -> Optional[Request]:
        """Mark evaluation as completed."""
        # Get existing request
        request = await self.storage.get_request(request_id)
        if not request:
            return None
        
        # Validate status transition
        if request.status != "in_progress":
            raise ValueError(f"Cannot complete request with status '{request.status}'")
        
        # Update request
        updated_request = request.model_copy(update={
            "status": "completed",
            "completed_at": datetime.now(timezone.utc)
        })
        
        # Save updated request
        await self.storage.save_request(updated_request)
        logger.info(f"Completed evaluation {request_id} by {user.name}")
        
        return updated_request
    
    async def update_priority(
        self,
        request_id: str,
        priority: Priority,
        user: User
    ) -> Optional[Request]:
        """Update request priority (admin only)."""
        # Get existing request
        request = await self.storage.get_request(request_id)
        if not request:
            return None
        
        # Update priority
        updated_request = request.model_copy(update={"priority": priority})
        
        # Save updated request
        await self.storage.save_request(updated_request)
        logger.info(f"Updated priority of {request_id} to {priority.value} by {user.name}")
        
        return updated_request
    
    async def delete_request(self, request_id: str, user: User) -> bool:
        """Delete request."""
        success = await self.storage.delete_request(request_id)
        if success:
            logger.info(f"Deleted request {request_id} by {user.name}")
        return success
    
    async def search_requests(self, query: str) -> List[Request]:
        """Search requests by query string."""
        return await self.storage.search_requests(query)


# Global request service instance
request_service = RequestService()
