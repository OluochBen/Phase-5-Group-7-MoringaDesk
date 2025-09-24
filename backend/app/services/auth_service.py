from .. import db
from ..models import User
from ..schemas import UserRegistrationSchema, UserLoginSchema
from flask_jwt_extended import create_access_token
from marshmallow import ValidationError

class AuthService:
    @staticmethod
    def register_user(data):
        """Register a new user"""
        schema = UserRegistrationSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        # Create new user
        user = User(
            name=validated_data['name'],
            email=validated_data['email'],
            role=validated_data['role']
        )
        user.set_password(validated_data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate access token
        access_token = create_access_token(identity=str(user.id))
        
        return {
            'user': user.to_dict(),
            'access_token': access_token
        }, 201
    
    @staticmethod
    def login_user(data):
        """Login user and return token"""
        schema = UserLoginSchema()
        try:
            validated_data = schema.load(data)
        except ValidationError as err:
            return {'error': err.messages}, 400
        
        # Find user by email
        user = User.query.filter_by(email=validated_data['email']).first()
        
        if not user or not user.check_password(validated_data['password']):
            return {'error': 'Invalid email or password'}, 401
        
        # Generate access token
        access_token = create_access_token(identity=str(user.id))
        
        return {
            'user': user.to_dict(),
            'access_token': access_token
        }, 200
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        return User.query.get(user_id)
