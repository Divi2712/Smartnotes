from datetime import datetime
from fastapi import HTTPException
from bson import ObjectId

from database.mongodb import get_db
from models.note import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse


async def create_note(user_id: str, note_data: NoteCreate) -> NoteResponse:
    db = get_db()
    now = datetime.utcnow()
    doc = {
        "user_id": ObjectId(user_id),
        "title": note_data.title.strip(),
        "original_content": note_data.original_content,
        "summary": note_data.summary,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.notes.insert_one(doc)
    return _map_note({**doc, "_id": result.inserted_id})


async def get_note(note_id: str, user_id: str) -> NoteResponse:
    db = get_db()
    doc = await db.notes.find_one(
        {"_id": ObjectId(note_id), "user_id": ObjectId(user_id)}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Note not found")
    return _map_note(doc)


async def update_note(note_id: str, user_id: str, update_data: NoteUpdate) -> NoteResponse:
    db = get_db()
    existing = await db.notes.find_one(
        {"_id": ObjectId(note_id), "user_id": ObjectId(user_id)}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Note not found")

    update_fields = {"updated_at": datetime.utcnow()}
    if update_data.title is not None:
        update_fields["title"] = update_data.title.strip()
    if update_data.original_content is not None:
        update_fields["original_content"] = update_data.original_content
    if update_data.summary is not None:
        update_fields["summary"] = update_data.summary

    await db.notes.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": update_fields},
    )
    updated = await db.notes.find_one({"_id": ObjectId(note_id)})
    return _map_note(updated)


async def delete_note(note_id: str, user_id: str) -> dict:
    db = get_db()
    result = await db.notes.delete_one(
        {"_id": ObjectId(note_id), "user_id": ObjectId(user_id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}


async def get_user_notes(
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    search: str = None,
) -> NoteListResponse:
    db = get_db()
    skip = (page - 1) * page_size
    query: dict = {"user_id": ObjectId(user_id)}

    if search and search.strip():
        query["$text"] = {"$search": search.strip()}

    total = await db.notes.count_documents(query)
    cursor = db.notes.find(query).sort("updated_at", -1).skip(skip).limit(page_size)
    notes = await cursor.to_list(length=page_size)

    return NoteListResponse(
        notes=[_map_note(n) for n in notes],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


def _map_note(doc: dict) -> NoteResponse:
    return NoteResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        title=doc["title"],
        original_content=doc["original_content"],
        summary=doc.get("summary"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )

from bson import ObjectId
from database.mongodb import get_db

async def update_note(
    note_id: str,
    user_id: str,
    data: dict
):

    db = get_db()
    print("NOTE ID =", note_id)
    print("USER ID =", user_id)

    result = await db.notes.update_one(
        {
            "_id": ObjectId(note_id),
        },
        {
            "$set": {
                "title": data["title"],
                "original_content":
                    data["original_content"],
                "summary":
                    data["summary"]
            }
        }
    )
    print("MATCHED =", result.matched_count)
    print("MODIFIED =", result.modified_count)

    return {
        "success": result.modified_count > 0
    }
    