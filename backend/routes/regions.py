"""
Region API routes.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.models import Region
from schemas.schemas import RegionResponse

router = APIRouter(prefix="/api/regions", tags=["Regions"])


@router.get("", response_model=List[RegionResponse], status_code=status.HTTP_200_OK)
def get_regions(db: Session = Depends(get_db)):
    """Get all regions."""
    regions = db.query(Region).order_by(Region.name).all()
    return [RegionResponse.model_validate(r) for r in regions]


@router.get("/{region_id}", response_model=RegionResponse, status_code=status.HTTP_200_OK)
def get_region(region_id: int, db: Session = Depends(get_db)):
    """Get a specific region by ID."""
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Region not found")
    return RegionResponse.model_validate(region)
