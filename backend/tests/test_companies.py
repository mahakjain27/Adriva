def test_create_and_list_company(client, company_payload):
    response = client.post("/api/companies", json=company_payload)
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == company_payload["name"]
    assert body["slug"] == "test-distributors-inc"
    assert body["id"].startswith("company-")

    listed = client.get("/api/companies").json()
    assert len(listed) == 1
    assert listed[0]["id"] == body["id"]


def test_get_company_not_found(client):
    response = client.get("/api/companies/does-not-exist")
    assert response.status_code == 404
    assert response.json()["detail"] == "Company not found"


def test_update_company(client, company_payload):
    created = client.post("/api/companies", json=company_payload).json()
    payload = {**company_payload, "name": "Renamed Distributors"}
    response = client.put(f"/api/companies/{created['id']}", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Renamed Distributors"
    assert body["slug"] == "renamed-distributors"


def test_delete_company(client, company_payload):
    created = client.post("/api/companies", json=company_payload).json()
    response = client.delete(f"/api/companies/{created['id']}")
    assert response.status_code == 204
    assert client.get(f"/api/companies/{created['id']}").status_code == 404


def test_slug_collision_appends_suffix(client, company_payload):
    first = client.post("/api/companies", json=company_payload).json()
    second = client.post("/api/companies", json=company_payload).json()
    assert first["slug"] == "test-distributors-inc"
    assert second["slug"] == "test-distributors-inc-2"


def test_company_detail_includes_relations(client, company_payload):
    company = client.post("/api/companies", json=company_payload).json()
    employee_payload = {
        "companyId": company["id"],
        "photoPath": "",
        "name": "Jamie Rivera",
        "designation": "Sales Lead",
        "phones": [],
        "whatsapp": "",
        "emails": [],
        "websites": [],
        "social": {"linkedin": "", "instagram": "", "facebook": "", "twitter": "", "youtube": ""},
        "address": "",
        "mapsUrl": "",
        "workingHours": [],
        "customButtons": [],
        "theme": "luxury",
        "nfcCard": None,
    }
    client.post(f"/api/companies/{company['id']}/employees", json=employee_payload)

    detail = client.get(f"/api/companies/{company['id']}").json()
    assert len(detail["employees"]) == 1
    assert detail["employees"][0]["name"] == "Jamie Rivera"
