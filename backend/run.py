from flask import Flask

def create_app():
    app = Flask(__name__)

    # Simple test route to confirm the app is running
    @app.route('/')
    def home():
        return {"message": "MoringaDesk Backend is running!"}

    return app

