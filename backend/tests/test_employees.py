import pytest


@pytest.fixture()
def company(client, company_payload):
    return client.post("/api/companies", json=company_payload).json()


def employee_payload(company_id: str, name: str = "Jamie Rivera") -> dict:
    return {
        "companyId": company_id,
        "photoPath": "",
        "name": name,
        "designation": "Sales Lead",
        "phones": [{"id": "p1", "label": "", "value": "+15550000001"}],
        "whatsapp": "",
        "emails": [{"id": "e1", "label": "", "value": "jamie@example.com"}],
        "websites": [],
        "social": {"linkedin": "", "instagram": "", "facebook": "", "twitter": "", "youtube": ""},
        "address": "",
        "mapsUrl": "",
        "workingHours": [],
        "customButtons": [],
        "theme": "luxury",
        "nfcCard": None,
    }


def test_create_employee(client, company):
    response = client.post(f"/api/companies/{company['id']}/employees", json=employee_payload(company["id"]))
    assert response.status_code == 201
    body = response.json()
    assert body["slug"] == "jamie-rivera"
    assert body["companyId"] == company["id"]


def test_list_employees_all_and_by_company(client, company):
    client.post(f"/api/companies/{company['id']}/employees", json=employee_payload(company["id"]))
    assert len(client.get("/api/employees").json()) == 1
    assert len(client.get(f"/api/companies/{company['id']}/employees").json()) == 1


def test_employee_slug_unique_per_company_not_global(client, company_payload):
    company_a = client.post("/api/companies", json=company_payload).json()
    other_payload = {**company_payload, "name": "Another Company Inc."}
    company_b = client.post("/api/companies", json=other_payload).json()

    employee_a = client.post(f"/api/companies/{company_a['id']}/employees", json=employee_payload(company_a["id"])).json()
    employee_b = client.post(f"/api/companies/{company_b['id']}/employees", json=employee_payload(company_b["id"])).json()

    # Same name, different companies — both get the clean "jamie-rivera" slug
    # rather than the second being forced to "jamie-rivera-2", since
    # uniqueness is scoped per-company (see Employee model's composite index).
    assert employee_a["slug"] == "jamie-rivera"
    assert employee_b["slug"] == "jamie-rivera"


def test_update_employee_keeps_identity_stable(client, company):
    created = client.post(f"/api/companies/{company['id']}/employees", json=employee_payload(company["id"])).json()
    updated = client.put(
        f"/api/employees/{created['id']}",
        json={**employee_payload(company["id"], "Jamie R. Rivera")},
    ).json()
    # Name can change; slug (identity asset) must not, per employeesService.ts's existing contract.
    assert updated["slug"] == created["slug"]
    assert updated["name"] == "Jamie R. Rivera"


def test_duplicate_employee_creates_new_record(client, company):
    created = client.post(f"/api/companies/{company['id']}/employees", json=employee_payload(company["id"])).json()
    copy = client.post(f"/api/employees/{created['id']}/duplicate").json()
    assert copy["id"] != created["id"]
    assert copy["slug"] != created["slug"]
    assert copy["name"] == "Jamie Rivera (Copy)"


def test_delete_employee(client, company):
    created = client.post(f"/api/companies/{company['id']}/employees", json=employee_payload(company["id"])).json()
    assert client.delete(f"/api/employees/{created['id']}").status_code == 204
    assert client.get(f"/api/employees/{created['id']}").status_code == 404
