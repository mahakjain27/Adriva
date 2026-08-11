import io

from PIL import Image


def _make_png_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="PNG")
    return buffer.getvalue()


def test_upload_valid_image_succeeds(client):
    files = {"file": ("logo.png", _make_png_bytes(), "image/png")}
    response = client.post("/api/uploads", data={"category": "companies"}, files=files)
    assert response.status_code == 200
    body = response.json()
    assert body["path"].startswith("/uploads/companies/")
    assert body["mimeType"] == "image/png"
    assert body["size"] > 0


def test_upload_rejects_non_image_content(client):
    files = {"file": ("fake.jpg", b"not actually an image", "image/jpeg")}
    response = client.post("/api/uploads", data={"category": "companies"}, files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid image type"


def test_upload_rejects_oversized_file(client):
    oversized = _make_png_bytes() + b"\x00" * (5 * 1024 * 1024)
    files = {"file": ("huge.png", oversized, "image/png")}
    response = client.post("/api/uploads", data={"category": "companies"}, files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "Image exceeds 5 MB"


def test_upload_rejects_invalid_category(client):
    files = {"file": ("logo.png", _make_png_bytes(), "image/png")}
    response = client.post("/api/uploads", data={"category": "not-a-real-category"}, files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid upload category"
