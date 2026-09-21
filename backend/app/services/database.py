import time
import os
from typing import Dict, Any, List
from supabase import create_client, Client

class DatabaseSessionManager:
    """Manages user sessions, auditable execution logs, and database persistence via Supabase."""
    
    _supabase_url = os.getenv("SUPABASE_URL", "")
    _supabase_key = os.getenv("SUPABASE_KEY", "")
    
    @classmethod
    def _get_client(cls) -> Client | None:
        if cls._supabase_url and cls._supabase_key:
            try:
                return create_client(cls._supabase_url, cls._supabase_key)
            except Exception as e:
                print(f"Error initializing Supabase client: {e}")
                return None
        return None

    # Fallback in-memory storage if Supabase is not configured
    _sessions: Dict[str, Dict[str, Any]] = {}
    _execution_logs: List[Dict[str, Any]] = []

    @classmethod
    def save_execution_log(cls, session_id: str, query: str, task_type: str, result: Dict[str, Any]) -> Dict[str, Any]:
        log_entry = {
            "log_id": f"log_{int(time.time() * 1000)}",
            "session_id": session_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "query": query,
            "task_type": task_type,
            "selected_tool": result.get("selected_tool", {}).get("name", "Tool"),
            "confidence": result.get("confidence", 0.9),
            "trace_log": result.get("trace_log", []),
            "report_filename": result.get("report_filename"),
            "llm_engine": result.get("llm_engine")
        }
        
        supabase = cls._get_client()
        if supabase:
            try:
                # Assuming a table named 'execution_logs' exists in Supabase
                supabase.table("execution_logs").insert(log_entry).execute()
            except Exception as e:
                print(f"Error saving to Supabase: {e}")
                # Fallback to local
                cls._execution_logs.append(log_entry)
        else:
            cls._execution_logs.append(log_entry)
        
        if session_id not in cls._sessions:
            cls._sessions[session_id] = {"session_id": session_id, "created_at": log_entry["timestamp"], "history": []}
        cls._sessions[session_id]["history"].append(log_entry)
        
        return log_entry

    @classmethod
    def get_session_history(cls, session_id: str) -> List[Dict[str, Any]]:
        supabase = cls._get_client()
        if supabase:
            try:
                response = supabase.table("execution_logs").select("*").eq("session_id", session_id).order("timestamp").execute()
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Error reading from Supabase: {e}")
        
        return cls._sessions.get(session_id, {}).get("history", [])

    @classmethod
    def get_all_logs(cls) -> List[Dict[str, Any]]:
        supabase = cls._get_client()
        if supabase:
            try:
                response = supabase.table("execution_logs").select("*").order("timestamp", desc=True).execute()
                if response.data:
                    return response.data
            except Exception as e:
                print(f"Error reading from Supabase: {e}")

        return cls._execution_logs
