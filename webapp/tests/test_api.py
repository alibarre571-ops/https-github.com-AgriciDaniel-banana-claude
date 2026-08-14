import base64
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_index_serves_html():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "Banana Image Studio" in resp.text


def test_generate_requires_prompt():
    resp = client.post("/api/generate", json={"prompt": "  "})
    assert resp.status_code == 400


@patch("app.main.generate_image", new_callable=AsyncMock)
def test_generate_success(mock_generate):
    mock_generate.return_value = {
        "image_base64": base64.b64encode(b"fake-image-bytes").decode(),
        "mime_type": "image/png",
        "text": "",
    }
    resp = client.post("/api/generate", json={"prompt": "a cat in space"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["mime_type"] == "image/png"
    mock_generate.assert_awaited_once()


def test_edit_requires_prompt():
    resp = client.post(
        "/api/edit",
        data={"prompt": ""},
        files={"image": ("test.png", b"fake", "image/png")},
    )
    assert resp.status_code == 422  # empty Form(...) fails validation before the handler runs


@patch("app.main.edit_image", new_callable=AsyncMock)
def test_edit_success(mock_edit):
    mock_edit.return_value = {
        "image_base64": base64.b64encode(b"fake-edited-bytes").decode(),
        "mime_type": "image/png",
        "text": "done",
    }
    resp = client.post(
        "/api/edit",
        data={"prompt": "remove the background"},
        files={"image": ("test.png", b"fake", "image/png")},
    )
    assert resp.status_code == 200
    assert resp.json()["text"] == "done"
    mock_edit.assert_awaited_once()
