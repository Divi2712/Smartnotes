from fastapi import Header, HTTPException
from jose import jwt, JWTError
import os

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "supersecretkey"
)

ALGORITHM = "HS256"

async def get_current_user(
    authorization: str = Header(None)
):

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )

    try:

        token = authorization.replace(
            "Bearer ",
            ""
        )

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return {
            "id": payload["user_id"],
            "email": payload["email"]
        }

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

