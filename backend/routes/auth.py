"""
Authentication API routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from schemas.schemas import LoginRequest, TokenResponse, UserResponse
from services.auth_service import authenticate_user, create_access_token
from services.audit_service import log_action

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = authenticate_user(db, request.username, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={
        "sub": user.username,
        "role": user.role,
        "user_id": user.id,
    })

    log_action(db, user.username, "LOGIN", "auth",
               f"User {user.username} logged in",
               ip_address=req.client.host if req.client else None)

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )
