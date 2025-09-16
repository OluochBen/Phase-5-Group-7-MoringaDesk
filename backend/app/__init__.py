from flask import Flask

def create_app():
    app = Flask(__name__)

    # Example simple route
    @app.route('/')
    def index():
        return {"message": "MoringaDesk Backend is running from __init__.py!"}

    return app
