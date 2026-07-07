import os
import uuid
from datetime import datetime
from pathlib import Path
from fastapi import HTTPException, UploadFile
from supabase import create_client
from dotenv import load_dotenv
from bson import ObjectId
from database.mongodb import get_db
from models.file import FileInDB, FileResponse, ALLOWED_EXTENSIONS
from services.ai_service import summarize_text

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "ai-notes")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "100"))

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_file_category(extension: str) -> str:
    for category, exts in ALLOWED_EXTENSIONS.items():
        if extension.lower() in exts:
            return category
    return "unknown"


def get_content_type(extension: str) -> str:
    content_types = {
        ".txt": "text/plain",
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
    }
    return content_types.get(extension.lower(), "application/octet-stream")


async def upload_file_to_r2(file: UploadFile, user_id: str) -> FileResponse:
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    category = get_file_category(ext)
    if category == "unknown":
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed.",
        )

    # Read content
    content = await file.read()
    text_content = ""
    if category == "text":
        try:
            text_content = content.decode("utf-8")
        except:
            text_content = "Unable to decode text"
    elif category == "image":
        from services.ocr_service import extract_text_from_image
        temp_path = file.filename
        with open(temp_path, "wb") as f:
            f.write(content)
        text_content = extract_text_from_image(temp_path)
    elif category == "audio":
        from services.audio_service import transcribe_audio
        temp_path = file.filename
        with open(temp_path, "wb") as f:
            f.write(content)
        text_content = transcribe_audio(temp_path)
    elif category == "video":
        from services.video_service import extract_audio_from_video
        temp_path = file.filename
        with open(temp_path, "wb") as f:
            f.write(content)
            text_content = extract_audio_from_video(temp_path)
    else:
        text_content = "Unsupported file type"

    summary = summarize_text(text_content)
    file_size = len(content)

    if file_size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_UPLOAD_SIZE_MB}MB")

    # Unique path inside bucket
    unique_path = f"{user_id}/{category}/{uuid.uuid4().hex}{ext}"
    content_type = get_content_type(ext)

    # Upload to Supabase Storage
    try:
        supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=unique_path,
            file=content,
            file_options={"content-type": content_type},
        )
        file_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{unique_path}"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    # Save metadata to MongoDB
    db = get_db()
    file_doc = {
        "user_id": ObjectId(user_id),
        "file_name": file.filename,
        "file_type": category,
        "file_extension": ext,
        "file_size": file_size,
        "file_url": file_url,
        "storage_path": unique_path,
        "upload_date": datetime.utcnow(),
        "status": "uploaded",
    }
    result = await db.files.insert_one(file_doc)

    return {
        "id": str(result.inserted_id),
        "user_id": user_id,
        "file_name": file.filename,
        "file_type": category,
        "file_size": file_size,
        "file_url": file_url,
        "upload_date": file_doc["upload_date"].isoformat(),
        "status": "uploaded",
        "summary": summary,
    }



async def delete_file(file_id: str, user_id: str) -> dict:
    db = get_db()
    file_doc = await db.files.find_one(
        {"_id": ObjectId(file_id), "user_id": ObjectId(user_id)}
    )
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        supabase.storage.from_(SUPABASE_BUCKET).remove([file_doc.get("storage_path", "")])
    except Exception:
        pass

    await db.files.delete_one({"_id": ObjectId(file_id)})
    return {"message": "File deleted successfully"}


async def get_user_files(user_id: str, page: int = 1, page_size: int = 20) -> dict:
    db = get_db()
    skip = (page - 1) * page_size
    query = {"user_id": ObjectId(user_id)}
    total = await db.files.count_documents(query)
    cursor = db.files.find(query).sort("upload_date", -1).skip(skip).limit(page_size)
    files = await cursor.to_list(length=page_size)

    return {
        "files": [_map_file(f) for f in files],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


def _map_file(doc: dict) -> FileResponse:
    return FileResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        file_name=doc["file_name"],
        file_type=doc["file_type"],
        file_size=doc["file_size"],
        file_url=doc["file_url"],
        upload_date=doc["upload_date"],
        status=doc["status"],
    )