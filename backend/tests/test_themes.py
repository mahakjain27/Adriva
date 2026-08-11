import pytest


@pytest.fixture()
def company(client, company_payload):
    return client.post("/api/companies", json=company_payload).json()


def test_get_company_theme_defaults(client, company):
    response = client.get(f"/api/companies/{company['id']}/theme")
    assert response.status_code == 200
    body = response.json()
    assert body["defaultTheme"] == "luxury"
    assert body["brand"] is None


def test_update_company_theme_persists(client, company):
    payload = {
        "defaultTheme": "modern",
        "brand": {"color": "#ff0000", "ombre": "sunset", "secondColor": None},
        "style": {"glass": "crystal", "buttons": "glass", "corners": "sharp"},
        "typography": None,
        "motion": "expressive",
    }
    response = client.put(f"/api/companies/{company['id']}/theme", json=payload)
    assert response.status_code == 200
    assert response.json()["brand"]["color"] == "#ff0000"

    refetched = client.get(f"/api/companies/{company['id']}/theme").json()
    assert refetched["defaultTheme"] == "modern"
    assert refetched["motion"] == "expressive"


def test_saved_theme_crud_and_favorite(client):
    create_payload = {
        "name": "Emerald Luxury",
        "baseTheme": "luxury",
        "brand": {"color": "#10b981", "ombre": "off", "secondColor": None},
        "style": None,
        "typography": None,
        "motion": None,
    }
    created = client.post("/api/themes", json=create_payload).json()
    assert created["favorite"] is False

    favorited = client.put(f"/api/themes/{created['id']}", json={"favorite": True}).json()
    assert favorited["favorite"] is True
    assert favorited["name"] == "Emerald Luxury"  # unset fields in a partial update aren't clobbered

    listed = client.get("/api/themes").json()
    assert len(listed) == 1

    duplicate = client.post(f"/api/themes/{created['id']}/duplicate").json()
    assert duplicate["id"] != created["id"]
    assert duplicate["name"] == "Emerald Luxury (Copy)"
    assert duplicate["favorite"] is False

    assert client.delete(f"/api/themes/{created['id']}").status_code == 204
    assert client.get(f"/api/themes/{created['id']}").status_code == 404
