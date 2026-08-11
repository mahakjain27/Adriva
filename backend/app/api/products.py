from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Product as ProductORM
from app.schemas.product import Product, ProductCreate, ProductReorderRequest, ProductUpdate

router = APIRouter(tags=["products"])


def _get_product_or_404(db: Session, product_id: str) -> ProductORM:
    product = db.get(ProductORM, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/api/companies/{company_id}/products", response_model=list[Product], tags=["products"])
def list_products_by_company(company_id: str, db: Session = Depends(get_db)):
    return (
        db.query(ProductORM)
        .filter(ProductORM.company_id == company_id)
        .order_by(ProductORM.sort_order)
        .all()
    )


@router.post("/api/companies/{company_id}/products", response_model=Product, status_code=201, tags=["products"])
def create_product(company_id: str, payload: ProductCreate, db: Session = Depends(get_db)):
    if payload.company_id != company_id:
        raise HTTPException(status_code=400, detail="companyId in body must match the URL")
    sibling_count = db.query(ProductORM).filter(ProductORM.company_id == company_id).count()
    product = ProductORM(**payload.model_dump(), sort_order=sibling_count)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put(
    "/api/companies/{company_id}/products/reorder",
    response_model=list[Product],
    tags=["products"],
)
def reorder_products(company_id: str, payload: ProductReorderRequest, db: Session = Depends(get_db)):
    products = db.query(ProductORM).filter(ProductORM.company_id == company_id).all()
    order_index = {product_id: index for index, product_id in enumerate(payload.ordered_ids)}
    for product in products:
        if product.id in order_index:
            product.sort_order = order_index[product.id]
    db.commit()
    return (
        db.query(ProductORM)
        .filter(ProductORM.company_id == company_id)
        .order_by(ProductORM.sort_order)
        .all()
    )


@router.get("/api/products/{product_id}", response_model=Product)
def get_product(product_id: str, db: Session = Depends(get_db)):
    return _get_product_or_404(db, product_id)


@router.put("/api/products/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = _get_product_or_404(db, product_id)
    for key, value in payload.model_dump(exclude={"company_id"}).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/api/products/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = _get_product_or_404(db, product_id)
    db.delete(product)
    db.commit()
