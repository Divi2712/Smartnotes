from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from video_service import extract_audio_from_video

from ai_service import summarize_text
from ocr_service import extract_text_from_image
from audio_service import transcribe_audio
from pdf_service import extract_pdf_text
from ppt_service import extract_ppt_text
from docx_service import extract_docx_text
import tempfile
import os
app = FastAPI()

# ---------------- TEXT ---------------- #

class TextInput(BaseModel):
    text: str
    mode: str = "detailed"

@app.post("/summarize-text")
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

@app.post("/summarize-image")
async def summarize_image(file: UploadFile = File(...)):

    temp_file = file.filename

    with open(temp_file, "wb") as f:
        f.write(await file.read())

    extracted_text = extract_text_from_image(temp_file)

    summary = summarize_text(extracted_text)
    print(summary)
    return {
        "extracted_text": extracted_text,
        "summary": summary
    }

# ---------------- AUDIO ---------------- #

@app.post("/summarize-audio")
async def summarize_audio(file: UploadFile = File(...)):

    temp_file = file.filename

    with open(temp_file, "wb") as f:
        f.write(await file.read())

    transcript = transcribe_audio(temp_file)

    summary = summarize_text(transcript)

    print(summary)

    return {
        "transcript": transcript,
        "summary": summary
    }

@app.post("/summarize-video")
async def summarize_video(file: UploadFile = File(...)):

    temp_video = file.filename

    # Save uploaded video
    with open(temp_video, "wb") as f:
        f.write(await file.read())

    # Extract audio
    audio_path = extract_audio_from_video(temp_video)

    # Convert speech to text
    transcript = transcribe_audio(audio_path)

    # Generate AI summary
    summary = summarize_text(transcript)

    print(summary)

    return {
        "transcript": transcript,
        "summary": summary
    }

@app.post("/summarize-pdf")
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

@app.post("/summarize-ppt")
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

        summary = summarize_text_content(
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

@app.post("/summarize-docx")
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

        summary = summarize_text_content(
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