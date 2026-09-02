"""
Audit Log Service

Records important platform actions for accountability and traceability.
"""

from sqlalchemy.orm import Session
from models.models import AuditLog
from datetime import datetime


def log_action(
    db: Session,
    user: str,
    action: str,
    resource: str,
    detail: str = None,
    ip_address: str = None,
) -> AuditLog:
    """
    Record an audit log entry.
    
    Args:
        db: Database session
        user: Username or identifier of the actor
        action: Action performed (LOGIN, CREATE_ALERT, APPROVE_ADVISORY, etc.)
        resource: Resource type affected (auth, alert, advisory, sensor, etc.)
        detail: Additional detail about the action
        ip_address: IP address of the client
    """
    entry = AuditLog(
        user=user,
        action=action,
        resource=resource,
        detail=detail,
        ip_address=ip_address,
        timestamp=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
