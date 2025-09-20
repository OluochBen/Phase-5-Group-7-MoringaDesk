# backend/app/__init__.py
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
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///moringadesk.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False
    app.config['JWT_ALGORITHM'] = 'HS256'

    # Extensions
    db.init_app(app)
    from . import models            
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app)

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

    # Blueprints (all relative)
    from .routes.auth import auth_bp
    from .routes.problems import problems_bp
    from .routes.solutions import solutions_bp
    from .routes.faqs import faqs_bp
    from .routes.notifications import notifications_bp
    from .routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(problems_bp, url_prefix='/problems')
    app.register_blueprint(solutions_bp, url_prefix='/solutions')
    app.register_blueprint(faqs_bp, url_prefix='/faqs')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    @app.route('/ping')
    def ping():
        return {'status': 'ok'}

    return app
