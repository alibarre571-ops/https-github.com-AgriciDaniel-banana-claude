"""Banana Image Studio -- FastAPI backend for Gemini-powered image generation/editing."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.gemini import GeminiError, edit_image, generate_image

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(title="Banana Image Studio", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "1:1"
    resolution: str = "2K"
    model: Optional[str] = None


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/generate")
async def api_generate(req: GenerateRequest):
    if not req.prompt.strip():
        raise HTTPException(400, "prompt is required")
    try:
        return await generate_image(req.prompt, req.aspect_ratio, req.resolution, req.model)
    except GeminiError as e:
        raise HTTPException(e.status, e.message) from e


@app.post("/api/edit")
async def api_edit(
    prompt: str = Form(...),
    image: UploadFile = File(...),
    model: Optional[str] = Form(None),
):
    if not prompt.strip():
        raise HTTPException(400, "prompt is required")
    data = await image.read()
    if not data:
        raise HTTPException(400, "image file is empty")
    try:
        return await edit_image(data, image.content_type or "image/png", prompt, model)
    except GeminiError as e:
        raise HTTPException(e.status, e.message) from e


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")
