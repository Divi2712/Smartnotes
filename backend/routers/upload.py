from fastapi import APIRouter, Depends, UploadFile, File, Query
from models.file import FileResponse, FileListResponse
from services.upload_service import upload_file_to_r2, delete_file, get_user_files
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/files", tags=["File Upload"])


#@router.post("/upload", response_model=FileResponse, status_code=201)
#async def upload_file(
#     file: UploadFile = File(...),
#     current_user: dict = {"id": "507f1f77bcf86cd799439011"},
# ):
#     """
#     Upload a file (txt, pdf, jpg, jpeg, png, mp3, wav, mp4, mov).
#     File is stored in Cloudflare R2 and metadata saved in MongoDB.
#     """
#     return await upload_file_to_r2(file, current_user["id"])
@router.post("/upload", status_code=201)
async def upload_file(
    file: UploadFile = File(...),
):
    """
    Upload a file.
    """
    fake_user_id = "507f1f77bcf86cd799439011"
    return await upload_file_to_r2(
        file,
        fake_user_id
    )




@router.get("/", response_model=FileListResponse)
async def list_files(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = {"id": "507f1f77bcf86cd799439011"},
):
    """Get all uploaded files for the current user with pagination."""
    result = await get_user_files(current_user["id"], page, page_size)
    return result


@router.delete("/{file_id}")
async def delete_file_endpoint(
    file_id: str,
    current_user: dict = {"id": "507f1f77bcf86cd799439011"},
):
    """Delete a file by ID (removes from R2 and MongoDB)."""
    return await delete_file(file_id, current_user["id"])
