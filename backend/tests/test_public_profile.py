def test_full_flow_create_company_employee_products_theme_then_public_profile(client, company_payload):
    """The end-to-end flow the spec asks to verify at minimum: create company
    -> create employee -> create products -> save theme -> public profile loads."""
    company = client.post("/api/companies", json=company_payload).json()

    employee_payload = {
        "companyId": company["id"],
        "photoPath": "",
        "name": "Morgan Lee",
        "designation": "Founder",
        "phones": [{"id": "p1", "label": "", "value": "+15550000099"}],
        "whatsapp": "+15550000099",
        "emails": [{"id": "e1", "label": "", "value": "morgan@example.com"}],
        "websites": [],
        "social": {"linkedin": "", "instagram": "", "facebook": "", "twitter": "", "youtube": ""},
        "address": "",
        "mapsUrl": "",
        "workingHours": [{"day": "Mon - Fri", "hours": "9am - 5pm"}],
        "customButtons": [],
        "theme": "luxury",
        "nfcCard": None,
    }
    employee = client.post(f"/api/companies/{company['id']}/employees", json=employee_payload).json()

    for name in ["Widget", "Gadget"]:
        client.post(
            f"/api/companies/{company['id']}/products",
            json={"companyId": company["id"], "name": name, "price": "$1", "imagePaths": [], "category": ""},
        )

    theme_payload = {
        "defaultTheme": "luxury",
        "brand": {"color": "#8b5cf6", "ombre": "off", "secondColor": None},
        "style": None,
        "typography": None,
        "motion": "standard",
    }
    client.put(f"/api/companies/{company['id']}/theme", json=theme_payload)

    response = client.get(f"/api/public/profiles/{company['slug']}/{employee['slug']}")
    assert response.status_code == 200
    body = response.json()
    assert body["employee"]["name"] == "Morgan Lee"
    assert body["company"]["name"] == company_payload["name"]
    assert {p["name"] for p in body["products"]} == {"Widget", "Gadget"}

    # Public payload must not leak admin-only audit metadata.
    assert "createdAt" not in body["company"]
    assert "createdAt" not in body["employee"]


def test_public_profile_reflects_company_updates_automatically(client, company_payload):
    """Company info changing (e.g. website) must show up on the employee's
    public profile without touching the employee record — inheritance, not
    duplication."""
    company = client.post("/api/companies", json=company_payload).json()
    employee_payload = {
        "companyId": company["id"],
        "photoPath": "",
        "name": "Sam Okafor",
        "designation": "Rep",
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

    before = client.get(f"/api/public/profiles/{company['slug']}/{employee['slug']}").json()
    assert before["company"]["website"] == company_payload["website"]

    updated_company_payload = {**company_payload, "website": "https://updated.example.com"}
    client.put(f"/api/companies/{company['id']}", json=updated_company_payload)

    after = client.get(f"/api/public/profiles/{company['slug']}/{employee['slug']}").json()
    assert after["company"]["website"] == "https://updated.example.com"


def test_public_profile_404_for_unknown_company_or_employee(client, company_payload):
    response = client.get("/api/public/profiles/no-such-company/no-such-employee")
    assert response.status_code == 404

    company = client.post("/api/companies", json=company_payload).json()
    response = client.get(f"/api/public/profiles/{company['slug']}/no-such-employee")
    assert response.status_code == 404
