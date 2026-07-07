from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from middleware.auth_middleware import (
    get_current_user
)

from models.note import (
    NoteCreate
)

from services.note_service import (
    create_note,
    get_user_notes,
    delete_note,
    update_note
)

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

# Create Note
@router.post("/")
async def add_note(
    note: NoteCreate,
    current_user: dict = Depends(get_current_user)
):

    return await create_note(
        current_user["id"],
        note
    )

# Get Notes
@router.get("/")
async def fetch_notes(
    current_user: dict = Depends(get_current_user)
):

    return await get_user_notes(
        current_user["id"]
    )

@router.put("/{note_id}")
async def edit_note(
    note_id: str,
    note: dict,
    current_user: dict = Depends(get_current_user)
):

    print("UPDATE ROUTE HIT")
    print(note_id)
    print(note)

    return await update_note(
        note_id,
        current_user["id"],
        note
    )
# Delete Note
@router.delete("/{note_id}")
async def remove_note(
    note_id: str,
    current_user: dict = Depends(get_current_user)
):

    return await delete_note(
        note_id,
        current_user["id"]
    )

@router.put("/{note_id}/favorite")
async def toggle_favorite(
    note_id: str
):

    db = get_db()

    note = await db.notes.find_one({
        "_id": ObjectId(note_id)
    })

    if not note:
        return {
            "success": False
        }

    new_value = not note.get(
        "is_favorite",
        False
    )

    await db.notes.update_one(
        {
            "_id": ObjectId(note_id)
        },
        {
            "$set": {
                "is_favorite": new_value
            }
        }
    )

    return {
        "success": True,
        "is_favorite": new_value
    }