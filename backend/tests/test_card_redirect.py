from tests.conftest import TEST_PUBLIC_PROFILE_BASE_URL


def _create_employee(client, company_payload):
    company = client.post("/api/companies", json=company_payload).json()
    employee_payload = {
        "companyId": company["id"],
        "photoPath": "",
        "name": "Jordan Blake",
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
    employee = client.post(f"/api/companies/{company['id']}/employees", json=employee_payload).json()
    return company, employee


def test_card_redirect_points_at_current_slug_pair(client, company_payload):
    company, employee = _create_employee(client, company_payload)

    response = client.get(f"/c/{employee['id']}", follow_redirects=False)

    assert response.status_code == 302
    assert response.headers["location"] == f"{TEST_PUBLIC_PROFILE_BASE_URL}/{company['slug']}/{employee['slug']}"


def test_card_redirect_follows_a_company_rename(client, company_payload):
    """The whole point of the /c/{id} indirection: a company rename changes
    its slug (see companies.py's update_company), but the permanent link
    already printed on a card must still resolve — to the *new* slug."""
    company, employee = _create_employee(client, company_payload)

    renamed_payload = {**company_payload, "name": "Totally Renamed Co"}
    client.put(f"/api/companies/{company['id']}", json=renamed_payload)
    renamed_company = client.get(f"/api/companies/{company['id']}").json()
    assert renamed_company["slug"] != company["slug"]

    response = client.get(f"/c/{employee['id']}", follow_redirects=False)

    assert response.status_code == 302
    assert response.headers["location"] == f"{TEST_PUBLIC_PROFILE_BASE_URL}/{renamed_company['slug']}/{employee['slug']}"


def test_card_redirect_404_for_unknown_employee_id(client):
    response = client.get("/c/no-such-employee", follow_redirects=False)
    assert response.status_code == 404


def test_card_redirect_requires_no_admin_key(client, company_payload):
    """The /c/{id} redirect must stay public — it's the link burned onto NFC
    chips and printed QR codes, which can never carry the admin key."""
    _, employee = _create_employee(client, company_payload)

    response = client.get(f"/c/{employee['id']}", headers={"Authorization": ""}, follow_redirects=False)

    assert response.status_code == 302
