"""JSON file storage with atomic writes and file locking."""
import json
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict
import aiofiles
from app.models.request import Request
from app.utils.logger import get_logger

logger = get_logger(__name__)


class JSONStorage:
    """Storage layer for managing evaluation requests as JSON files."""
    
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = Path(data_dir)
        self.requests_dir = self.data_dir / "requests"
        self.backups_dir = self.data_dir / "backups"
        self.index_file = self.data_dir / "index.json"
        
        # Create directories if they don't exist
        self.requests_dir.mkdir(parents=True, exist_ok=True)
        self.backups_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize index if it doesn't exist
        if not self.index_file.exists():
            self._write_index({"request_ids": [], "last_updated": datetime.utcnow().isoformat()})
    
    def _write_index(self, data: dict) -> None:
        """Write index file atomically."""
        temp_file = self.index_file.with_suffix(".tmp")
        try:
            with open(temp_file, 'w') as f:
                json.dump(data, f, indent=2)
            os.replace(temp_file, self.index_file)
        except Exception as e:
            logger.error(f"Failed to write index: {e}")
            if temp_file.exists():
                temp_file.unlink()
            raise
    
    def _read_index(self) -> dict:
        """Read index file."""
        try:
            with open(self.index_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read index: {e}")
            return {"request_ids": [], "last_updated": datetime.utcnow().isoformat()}
    
    def _update_index_add(self, request_id: str) -> None:
        """Add request ID to index."""
        index = self._read_index()
        if request_id not in index["request_ids"]:
            index["request_ids"].append(request_id)
            index["last_updated"] = datetime.utcnow().isoformat()
            index["count"] = len(index["request_ids"])
            self._write_index(index)
    
    def _update_index_remove(self, request_id: str) -> None:
        """Remove request ID from index."""
        index = self._read_index()
        if request_id in index["request_ids"]:
            index["request_ids"].remove(request_id)
            index["last_updated"] = datetime.utcnow().isoformat()
            index["count"] = len(index["request_ids"])
            self._write_index(index)
    
    def _backup_request(self, request_id: str) -> None:
        """Create backup of request file."""
        source = self.requests_dir / f"{request_id}.json"
        if not source.exists():
            return
        
        # Create date-based backup directory
        backup_date_dir = self.backups_dir / datetime.utcnow().strftime("%Y-%m-%d")
        backup_date_dir.mkdir(parents=True, exist_ok=True)
        
        # Copy file to backup
        dest = backup_date_dir / f"{request_id}.json"
        try:
            shutil.copy2(source, dest)
            logger.info(f"Backed up request {request_id}")
        except Exception as e:
            logger.warning(f"Failed to backup request {request_id}: {e}")
    
    async def save_request(self, request: Request) -> None:
        """Save request to JSON file atomically."""
        request_id = request.id
        file_path = self.requests_dir / f"{request_id}.json"
        temp_path = file_path.with_suffix(".tmp")
        
        try:
            # Backup existing file if it exists
            if file_path.exists():
                self._backup_request(request_id)
            
            # Write to temporary file
            async with aiofiles.open(temp_path, 'w') as f:
                # Convert Pydantic model to dict and serialize
                data = request.model_dump(mode='json')
                await f.write(json.dumps(data, indent=2, default=str))
            
            # Atomic rename
            os.replace(temp_path, file_path)
            
            # Update index
            self._update_index_add(request_id)
            
            logger.info(f"Saved request {request_id}")
        except Exception as e:
            logger.error(f"Failed to save request {request_id}: {e}")
            if temp_path.exists():
                temp_path.unlink()
            raise
    
    async def get_request(self, request_id: str) -> Optional[Request]:
        """Retrieve request by ID."""
        file_path = self.requests_dir / f"{request_id}.json"
        
        if not file_path.exists():
            return None
        
        try:
            async with aiofiles.open(file_path, 'r') as f:
                content = await f.read()
                data = json.loads(content)
                return Request(**data)
        except Exception as e:
            logger.error(f"Failed to load request {request_id}: {e}")
            return None
    
    async def list_all_requests(self) -> List[Request]:
        """List all requests."""
        index = self._read_index()
        requests = []
        
        for request_id in index["request_ids"]:
            request = await self.get_request(request_id)
            if request:
                requests.append(request)
        
        return requests
    
    async def delete_request(self, request_id: str) -> bool:
        """Delete request file."""
        file_path = self.requests_dir / f"{request_id}.json"
        
        if not file_path.exists():
            return False
        
        try:
            # Backup before deletion
            self._backup_request(request_id)
            
            # Delete file
            file_path.unlink()
            
            # Update index
            self._update_index_remove(request_id)
            
            logger.info(f"Deleted request {request_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete request {request_id}: {e}")
            return False
    
    async def get_requests_by_status(self, status: str) -> List[Request]:
        """Get all requests with a specific status."""
        all_requests = await self.list_all_requests()
        return [req for req in all_requests if req.status == status]
    
    async def search_requests(self, query: str) -> List[Request]:
        """Search requests by query string."""
        all_requests = await self.list_all_requests()
        query_lower = query.lower()
        
        results = []
        for req in all_requests:
            # Search in multiple fields
            searchable = [
                req.purpose,
                req.purpose_reason or "",
                req.agent_type,
                *req.agents,
                req.submitter,
                req.executor or "",
                req.notes or ""
            ]
            
            if any(query_lower in str(field).lower() for field in searchable):
                results.append(req)
        
        return results
