from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from database.mongodb import get_db
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/uploads")
async def upload_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    file_type: str = Query(None, description="Filter by file type: text, pdf, image, audio, video"),
    current_user: dict = Depends(get_current_user),
):
    """
    Get paginated upload history for the current user.
    Optionally filter by file_type.
    """
    db = get_db()
    query: dict = {"user_id": ObjectId(current_user["id"])}
    if file_type:
        query["file_type"] = file_type

    skip = (page - 1) * page_size
    total = await db.files.count_documents(query)
    cursor = db.files.find(query).sort("upload_date", -1).skip(skip).limit(page_size)
    files = await cursor.to_list(page_size)

    return {
        "history": [
            {
                "id": str(f["_id"]),
                "file_name": f["file_name"],
                "file_type": f["file_type"],
                "file_size": f["file_size"],
                "file_url": f["file_url"],
                "upload_date": f["upload_date"].isoformat(),
                "status": f["status"],
            }
            for f in files
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/notes")
async def notes_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    """Get paginated notes history (sorted by most recently updated)."""
    db = get_db()
    query = {"user_id": ObjectId(current_user["id"])}
    skip = (page - 1) * page_size
    total = await db.notes.count_documents(query)
    cursor = db.notes.find(query).sort("updated_at", -1).skip(skip).limit(page_size)
    notes = await cursor.to_list(page_size)

    return {
        "history": [
            {
                "id": str(n["_id"]),
                "title": n["title"],
                "has_summary": bool(n.get("summary")),
                "created_at": n["created_at"].isoformat(),
                "updated_at": n["updated_at"].isoformat(),
            }
            for n in notes
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }
