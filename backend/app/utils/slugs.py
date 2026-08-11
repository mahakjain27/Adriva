import re

from sqlalchemy import select
from sqlalchemy.orm import Session


def slugify(value: str) -> str:
    """Byte-for-byte port of frontend/src/lib/utils.ts's slugify() — must stay
    identical so a name produces the same slug whether typed in the admin UI
    (optimistic client-side preview) or generated here on the server."""
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"^-+|-+$", "", value)
    return value


def unique_slug(db: Session, model, base_name: str, *, scope_filter=None, exclude_id: str | None = None) -> str:
    """Generic collision-avoiding slug generator — appends -2, -3, ... on
    collision, mirroring the exact suffix scheme employeesService.ts /
    companiesService.ts already use client-side."""
    base = slugify(base_name) or "item"
    slug = base
    suffix = 2
    while True:
        query = select(model).where(model.slug == slug)
        if scope_filter is not None:
            query = query.where(scope_filter)
        if exclude_id is not None:
            query = query.where(model.id != exclude_id)
        existing = db.execute(query).scalar_one_or_none()
        if existing is None:
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1
