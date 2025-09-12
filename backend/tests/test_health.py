from app import app
def test_ping():
    c = app.test_client()
    r = c.get("/ping")
    assert r.status_code == 200 and r.get_json()["status"] == "ok"
