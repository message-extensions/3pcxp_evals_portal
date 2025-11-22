"""File-based session storage for multi-worker environments."""
import json
import aiofiles
from pathlib import Path
from typing import Optional, Dict
from datetime import datetime, timezone
from app.models.user import Session
from app.utils.logger import get_logger

logger = get_logger(__name__)


class SessionStorage:
    """Persistent session storage using JSON files."""
    
    def __init__(self, storage_dir: str = "./data/sessions"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.verifiers_file = self.storage_dir / "verifiers.json"
        
        # Initialize verifiers file if not exists
        if not self.verifiers_file.exists():
            self.verifiers_file.write_text("{}")
    
    async def store_verifier(self, session_id: str, verifier: str) -> None:
        """Store code verifier for session."""
        try:
            # Read existing verifiers
            async with aiofiles.open(self.verifiers_file, 'r') as f:
                content = await f.read()
                verifiers = json.loads(content) if content else {}
            
            # Add new verifier
            verifiers[session_id] = verifier
            
            # Write back
            async with aiofiles.open(self.verifiers_file, 'w') as f:
                await f.write(json.dumps(verifiers, indent=2))
            
            logger.debug(f"Stored verifier for session {session_id}")
        except Exception as e:
            logger.error(f"Failed to store verifier: {e}")
            raise
    
    async def get_verifier(self, session_id: str) -> Optional[str]:
        """Retrieve code verifier for session."""
        try:
            async with aiofiles.open(self.verifiers_file, 'r') as f:
                content = await f.read()
                verifiers = json.loads(content) if content else {}
            
            return verifiers.get(session_id)
        except FileNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Failed to get verifier: {e}")
            return None
    
    async def delete_verifier(self, session_id: str) -> None:
        """Delete code verifier after use."""
        try:
            async with aiofiles.open(self.verifiers_file, 'r') as f:
                content = await f.read()
                verifiers = json.loads(content) if content else {}
            
            if session_id in verifiers:
                verifiers.pop(session_id)
                
                async with aiofiles.open(self.verifiers_file, 'w') as f:
                    await f.write(json.dumps(verifiers, indent=2))
                
                logger.debug(f"Deleted verifier for session {session_id}")
        except Exception as e:
            logger.error(f"Failed to delete verifier: {e}")
    
    async def store_session(self, session_id: str, session: Session) -> None:
        """Store user session."""
        session_file = self.storage_dir / f"{session_id}.json"
        try:
            async with aiofiles.open(session_file, 'w') as f:
                await f.write(session.model_dump_json(indent=2))
            
            logger.debug(f"Stored session for {session.user.name}")
        except Exception as e:
            logger.error(f"Failed to store session: {e}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """Retrieve user session."""
        session_file = self.storage_dir / f"{session_id}.json"
        
        if not session_file.exists():
            return None
        
        try:
            async with aiofiles.open(session_file, 'r') as f:
                content = await f.read()
                session = Session.model_validate_json(content)
            
            # Check if expired
            if datetime.now(timezone.utc) > session.expires_at:
                await self.delete_session(session_id)
                return None
            
            return session
        except Exception as e:
            logger.error(f"Failed to get session: {e}")
            return None
    
    async def delete_session(self, session_id: str) -> None:
        """Delete user session."""
        session_file = self.storage_dir / f"{session_id}.json"
        
        if session_file.exists():
            try:
                session_file.unlink()
                logger.debug(f"Deleted session {session_id}")
            except Exception as e:
                logger.error(f"Failed to delete session: {e}")
    
    async def cleanup_expired(self) -> int:
        """Remove expired sessions. Returns count of deleted sessions."""
        count = 0
        try:
            for session_file in self.storage_dir.glob("*.json"):
                if session_file.name == "verifiers.json":
                    continue
                
                try:
                    async with aiofiles.open(session_file, 'r') as f:
                        content = await f.read()
                        session = Session.model_validate_json(content)
                    
                    if datetime.now(timezone.utc) > session.expires_at:
                        session_file.unlink()
                        count += 1
                except Exception:
                    pass  # Skip invalid files
            
            if count > 0:
                logger.info(f"Cleaned up {count} expired sessions")
        except Exception as e:
            logger.error(f"Failed to cleanup sessions: {e}")
        
        return count
