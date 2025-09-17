import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    CORS(app)

    from . import models 

    @app.route('/')
    def index():
        return 'Backend Testing!' 
    
    from app.routes.users import users_bp
    app.register_blueprint(users_bp)

    app.register_blueprint(users_bp)

    return app
