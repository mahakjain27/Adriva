from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel


class ProductBase(CamelModel):
    company_id: str
    name: str = Field(min_length=1)
    price: str = ""
    image_paths: list[str] = []
    category: str = ""


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class Product(ProductBase):
    id: str
    sort_order: int
    created_at: datetime
    updated_at: datetime


class ProductSummary(CamelModel):
    """Lightweight shape for embedding inside CompanyWithRelations."""

    id: str
    name: str
    price: str = ""
    image_paths: list[str] = []
    category: str = ""
    sort_order: int = 0


class ProductReorderRequest(CamelModel):
    ordered_ids: list[str]
