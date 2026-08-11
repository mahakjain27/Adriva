import uuid


def new_id(prefix: str) -> str:
    """Matches the frontend mock services' existing ID format exactly
    (`"company-{uuid}"`, `"employee-{uuid}"`, ...) so switching to the real
    backend requires zero changes to how the frontend treats IDs — they're
    already opaque strings, never parsed."""
    return f"{prefix}-{uuid.uuid4()}"
