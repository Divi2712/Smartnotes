from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from fastapi import Form

from services.video_service import extract_audio_from_video
from services.ocr_service import extract_text_from_image
from services.audio_service import transcribe_audio
from services.ai_service import (summarize_text)
from services.pdf_service import extract_pdf_text
from services.ppt_service import extract_ppt_text
from services.docx_service import extract_docx_text
import tempfile
import os
from PIL import Image

def resize_image(path):

    img = Image.open(path)

    print("BEFORE:", img.size)

    img.thumbnail((1000, 1000))

    print("AFTER:", img.size)

    img.save(path)

router = APIRouter(
    prefix="/ai",
    tags=["AI Summarization"]
)

# ---------------- TEXT ---------------- #

class TextInput(BaseModel):
    text: str
    mode: str = "detailed"

@router.post("/summarize-text")
def summarize_text_api(data: TextInput):

    summary = summarize_text(
        data.text,
        data.mode
    )
    print(summary)
    return {
        "summary": summary
    }

# ---------------- IMAGE ---------------- #

@router.post("/summarize-image")
async def summarize_image(
    file: UploadFile = File(...),
    mode: str = Form("detailed")
):

    temp_file = file.filename

    with open(temp_file, "wb") as f:
        f.write(await file.read())

    import time
    resize_image(temp_file)
    start = time.time()


    text = extract_text_from_image(
        temp_file
    )

    print(
        "OCR TIME:",
        time.time() - start
    )

    print(
        "TEXT LENGTH:",
        len(text)
    )
    

    start = time.time()

    summary = summarize_text(
        text,
        mode
    )

    print(
        "SUMMARY TIME:",
        time.time() - start
    )
    print(summary)
    return {
        "extracted_text": text,
        "summary": summary
    }

# ---------------- AUDIO ---------------- #

@router.post("/summarize-audio")
async def summarize_audio(
    file: UploadFile = File(...),
    mode: str = Form("detailed")
):

    temp_file = file.filename

    with open(temp_file, "wb") as f:
        f.write(await file.read())

    transcript = transcribe_audio(temp_file)

    summary = summarize_text(
        transcript,
        mode
    )

    print(summary)

    return {
        "transcript": transcript,
        "summary": summary
    }

@router.post("/summarize-video")
async def summarize_video(
    file: UploadFile = File(...),
    mode: str = Form("detailed")
):

    temp_video = file.filename
    with open(temp_video, "wb") as f:
        f.write(await file.read())
    audio_path = extract_audio_from_video(
        temp_video
    )
    transcript = transcribe_audio(
        audio_path
    )
    summary = summarize_text(
        transcript,
        mode
    )
    return {
        "transcript": transcript,
        "summary": summary
    }

@router.post("/summarize-pdf")
async def summarize_pdf(
    file: UploadFile = File(...),
    mode: str = Form("short")
):
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as temp:
            content = await file.read()
            temp.write(content)
            temp_path = temp.name
        text = extract_pdf_text(
            temp_path
        )
        summary = summarize_text(
            text,
            mode
        )
        return {
            "summary": summary
        }
    except Exception as e:
        return {
            "error": str(e)
        }
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/summarize-ppt")
async def summarize_ppt(
    file: UploadFile = File(...),
    mode: str = Form("short")
):

    temp_path = None

    try:

        suffix = ".pptx"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp:

            content = await file.read()
            temp.write(content)

            temp_path = temp.name

        text = extract_ppt_text(temp_path)

        summary = summarize_text(
            text=text,
            mode=mode
        )

        return {
            "summary": summary
        }

    except Exception as e:

        return {
            "error": str(e)
        }

    finally:

        if (
            temp_path and
            os.path.exists(temp_path)
        ):
            os.remove(temp_path)

@router.post("/summarize-docx")
async def summarize_docx(
    file: UploadFile = File(...),
    mode: str = Form("short")
):

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".docx"
        ) as temp:

            content = await file.read()
            temp.write(content)

            temp_path = temp.name

        text = extract_docx_text(temp_path)

        summary = summarize_text(
            text=text,
            mode=mode
        )

        return {
            "summary": summary
        }

    except Exception as e:

        return {
            "error": str(e)
        }

    finally:

        if (
            temp_path and
            os.path.exists(temp_path)
        ):
            os.remove(temp_path)