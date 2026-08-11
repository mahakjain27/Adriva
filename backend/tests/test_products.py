import pytest


@pytest.fixture()
def company(client, company_payload):
    return client.post("/api/companies", json=company_payload).json()


def product_payload(company_id: str, name: str) -> dict:
    return {"companyId": company_id, "name": name, "price": "Custom quote", "imagePaths": [], "category": ""}


def test_create_product_assigns_sort_order(client, company):
    first = client.post(f"/api/companies/{company['id']}/products", json=product_payload(company["id"], "A")).json()
    second = client.post(f"/api/companies/{company['id']}/products", json=product_payload(company["id"], "B")).json()
    assert first["sortOrder"] == 0
    assert second["sortOrder"] == 1


def test_list_products_ordered_by_sort_order(client, company):
    for name in ["A", "B", "C"]:
        client.post(f"/api/companies/{company['id']}/products", json=product_payload(company["id"], name))
    listed = client.get(f"/api/companies/{company['id']}/products").json()
    assert [p["name"] for p in listed] == ["A", "B", "C"]


def test_reorder_products_persists_sort_order(client, company):
    products = [
        client.post(f"/api/companies/{company['id']}/products", json=product_payload(company["id"], name)).json()
        for name in ["A", "B", "C"]
    ]
    reversed_ids = [p["id"] for p in reversed(products)]

    response = client.put(
        f"/api/companies/{company['id']}/products/reorder", json={"orderedIds": reversed_ids}
    )
    assert response.status_code == 200
    reordered = response.json()
    assert [p["name"] for p in reordered] == ["C", "B", "A"]

    # Persisted, not just returned — a fresh list call reflects the same order.
    listed_again = client.get(f"/api/companies/{company['id']}/products").json()
    assert [p["name"] for p in listed_again] == ["C", "B", "A"]


def test_update_and_delete_product(client, company):
    product = client.post(f"/api/companies/{company['id']}/products", json=product_payload(company["id"], "A")).json()
    updated = client.put(
        f"/api/products/{product['id']}", json={**product_payload(company["id"], "A"), "price": "$10"}
    ).json()
    assert updated["price"] == "$10"

    assert client.delete(f"/api/products/{product['id']}").status_code == 204
    assert client.get(f"/api/products/{product['id']}").status_code == 404
