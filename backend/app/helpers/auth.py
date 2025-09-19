import bcrypt
from flask_jwt_extended import create_access_token, decode_token
from datetime import timedelta

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def generate_jwt(identity: str, expires_minutes: int = 60):
    return create_access_token(
        identity=identity,
        expires_delta=timedelta(minutes=expires_minutes)
    )

def decode_jwt(token: str):
    return decode_token(token)
