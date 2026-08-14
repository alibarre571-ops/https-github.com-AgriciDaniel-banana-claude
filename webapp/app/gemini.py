"""Async client for Google Gemini image generation/editing (Nano Banana models)."""

from __future__ import annotations

import base64
import os
from typing import Optional

import httpx

API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_MODEL = os.environ.get("BANANA_MODEL", "gemini-3.1-flash-image-preview")

VALID_RATIOS = {
    "1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2",
    "4:5", "5:4", "1:4", "4:1", "1:8", "8:1", "21:9",
}
VALID_RESOLUTIONS = {"512", "1K", "2K", "4K"}


class GeminiError(Exception):
    def __init__(self, message: str, status: int = 500):
        super().__init__(message)
        self.message = message
        self.status = status


def get_api_key() -> str:
    key = (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_AI_API_KEY")
        or os.environ.get("GOOGLE_API_KEY")
    )
    if not key:
        raise GeminiError("Server is missing a Gemini API key. Set GEMINI_API_KEY.", 500)
    return key


async def _call_gemini(body: dict, model: str) -> dict:
    api_key = get_api_key()
    url = f"{API_BASE}/{model}:generateContent"
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(url, params={"key": api_key}, json=body)
    if resp.status_code != 200:
        detail = resp.text
        if resp.status_code == 400 and "FAILED_PRECONDITION" in detail:
            raise GeminiError(
                "Billing not enabled on this Gemini API key. "
                "Enable billing at https://aistudio.google.com/apikey",
                402,
            )
        raise GeminiError(f"Gemini API error ({resp.status_code}): {detail}", 502)
    return resp.json()


def _extract_image(result: dict) -> tuple[str, str]:
    candidates = result.get("candidates", [])
    if not candidates:
        reason = result.get("promptFeedback", {}).get("blockReason", "UNKNOWN")
        raise GeminiError(f"No candidates returned. Reason: {reason}", 502)

    parts = candidates[0].get("content", {}).get("parts", [])
    image_data = None
    text_response = ""
    for part in parts:
        if "inlineData" in part:
            image_data = part["inlineData"]["data"]
        elif "text" in part:
            text_response = part["text"]

    if not image_data:
        reason = candidates[0].get("finishReason", "UNKNOWN")
        raise GeminiError(f"No image in response. finishReason: {reason}", 502)

    return image_data, text_response


async def generate_image(
    prompt: str,
    aspect_ratio: str = "1:1",
    resolution: str = "2K",
    model: Optional[str] = None,
) -> dict:
    if aspect_ratio not in VALID_RATIOS:
        raise GeminiError(f"Invalid aspect ratio '{aspect_ratio}'. Valid: {sorted(VALID_RATIOS)}", 400)
    if resolution not in VALID_RESOLUTIONS:
        raise GeminiError(f"Invalid resolution '{resolution}'. Valid: {sorted(VALID_RESOLUTIONS)}", 400)

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": aspect_ratio, "imageSize": resolution},
        },
    }
    result = await _call_gemini(body, model or DEFAULT_MODEL)
    image_b64, text = _extract_image(result)
    return {"image_base64": image_b64, "mime_type": "image/png", "text": text}


async def edit_image(
    image_bytes: bytes,
    mime_type: str,
    prompt: str,
    model: Optional[str] = None,
) -> dict:
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inlineData": {"mimeType": mime_type, "data": image_b64}},
                ]
            }
        ],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }
    result = await _call_gemini(body, model or DEFAULT_MODEL)
    out_b64, text = _extract_image(result)
    return {"image_base64": out_b64, "mime_type": "image/png", "text": text}
