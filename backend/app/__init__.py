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
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    

    from . import models 

    @app.route('/')
    def index():
        return 'Backend Testing!' 
    
    from app.routes.users import users_bp
    app.register_blueprint(users_bp)
    
    from app.routes.questions import questions_bp 
    app.register_blueprint(questions_bp)

    from app.routes.answers import answers_bp
    app.register_blueprint(answers_bp)




    return app
