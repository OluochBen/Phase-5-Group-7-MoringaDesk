from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Config
    db_url = os.getenv("DATABASE_URL", "sqlite:///moringadesk.db")
    is_pg = db_url.startswith(("postgres://", "postgresql://", "postgresql+psycopg2://"))
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)

    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret-string")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
    app.config["JWT_ALGORITHM"] = "HS256"

    if is_pg:
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": {"sslmode": "require"}}

    # Extensions
    db.init_app(app)
    from . import models  # ensure models are imported for migrations
    migrate.init_app(app, db)
    jwt.init_app(app)

    # CORS
    allowed_origins = [
        "http://localhost:5173",
        "https://moringadesk-gcvu.onrender.com",
    ]
    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token has expired'}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'error': 'Invalid token'}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'error': 'Authorization token is required'}, 401

    # Blueprints
    from .routes.auth import auth_bp
    from .routes.problems import problems_bp
    from .routes.solutions import solutions_bp
    from .routes.faqs import faqs_bp
    from .routes.notifications import notifications_bp
    from .routes.admin import admin_bp
    from .routes.tags import tags_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(problems_bp, url_prefix='/problems')
    app.register_blueprint(solutions_bp, url_prefix='/solutions')
    app.register_blueprint(faqs_bp, url_prefix='/faqs')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(tags_bp, url_prefix='/tags')

    @app.route('/ping')
    def ping():
        return {'status': 'ok'}

    return app
