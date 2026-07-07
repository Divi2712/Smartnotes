from fastapi import APIRouter, Depends
from services.dashboard_service import get_dashboard
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
async def dashboard(current_user: dict = Depends(get_current_user)):
    """
    Returns dashboard analytics:
    - Total uploads
    - Total notes
    - Storage used (MB)
    - Storage breakdown by file category
    - Recent 10 activities (uploads + notes)
    """
    return await get_dashboard(current_user["id"])
