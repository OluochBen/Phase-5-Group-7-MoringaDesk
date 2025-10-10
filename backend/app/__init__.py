from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_socketio import SocketIO
import os
from dotenv import load_dotenv


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
socketio = SocketIO()


def create_app():
    app = Flask(__name__)
    load_dotenv()

    # --- Database ---
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        base_dir = os.path.abspath(os.path.dirname(__file__))
        db_path = os.path.join(base_dir, "..", "instance", "app.db")
        db_url = f"sqlite:///{db_path}"
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret")

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(
        app,
        cors_allowed_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://moringadesk-gcvu.onrender.com",
        ],
    )

    # --- CORS ---
    CORS(
        app,
        resources={
            r"/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "https://moringadesk-gcvu.onrender.com",
                ]
            }
        },
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # --- Blueprints ---
    from .routes.public import public_bp
    from .routes.auth import auth_bp
    from .routes.problems import problems_bp
    from .routes.faqs import faqs_bp
    from .routes.admin import admin_bp
    from .routes.solutions import solutions_bp
    from .routes.notifications import notifications_bp
    from .routes.tags import tags_bp
    from .routes.profile import profile_bp

    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(problems_bp, url_prefix="/problems")
    app.register_blueprint(faqs_bp, url_prefix="/faqs")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(solutions_bp, url_prefix="/solutions")
    app.register_blueprint(notifications_bp, url_prefix="/notifications")
    app.register_blueprint(tags_bp, url_prefix="/tags")
    app.register_blueprint(profile_bp, url_prefix="/profile")

    # --- WebSocket events ---
    try:
        from . import events  # noqa: F401
    except ImportError:
        pass

    # --- Health check ---
    @app.route("/ping", methods=["GET", "OPTIONS"])
    def ping():
        return {"status": "ok"}, 200

    return app
