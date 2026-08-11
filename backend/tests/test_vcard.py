def test_vcard_contains_only_fields_that_exist(client, company_payload):
    company = client.post("/api/companies", json=company_payload).json()
    employee_payload = {
        "companyId": company["id"],
        "photoPath": "",
        "name": "Taylor Kim",
        "designation": "Account Manager",
        "phones": [{"id": "p1", "label": "", "value": "+15550001111"}],
        "whatsapp": "",
        "emails": [{"id": "e1", "label": "", "value": "taylor@example.com"}],
        "websites": [],
        "social": {"linkedin": "", "instagram": "", "facebook": "", "twitter": "", "youtube": ""},
        "address": "",  # left blank -> should fall back to company.address
        "mapsUrl": "",
        "workingHours": [],
        "customButtons": [],
        "theme": "luxury",
        "nfcCard": None,
    }
    employee = client.post(f"/api/companies/{company['id']}/employees", json=employee_payload).json()

    response = client.get(f"/api/public/profiles/{company['slug']}/{employee['slug']}/vcard")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/vcard")
    assert f'filename="{employee["slug"]}.vcf"' in response.headers["content-disposition"]

    text = response.text
    assert "BEGIN:VCARD" in text
    assert "FN:Taylor Kim" in text
    assert f"ORG:{company_payload['name']}" in text
    assert "TITLE:Account Manager" in text
    assert "TEL;TYPE=CELL:+15550001111" in text
    assert "EMAIL:taylor@example.com" in text
    # No custom website on the employee -> falls back to the company's.
    assert f"URL:{company_payload['website']}" in text
    # Address inherited from the company since the employee left theirs blank.
    assert f"ADR;TYPE=WORK:;;{company_payload['address']};;;;" in text
    assert "END:VCARD" in text


def test_vcard_404_for_unknown_profile(client):
    response = client.get("/api/public/profiles/no-such-company/no-such-employee/vcard")
    assert response.status_code == 404
