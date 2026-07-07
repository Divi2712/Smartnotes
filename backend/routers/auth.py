from fastapi import APIRouter, HTTPException
from datetime import datetime

from database.mongodb import get_db

from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Register
@router.post("/register")
async def register(user: dict):

    db = get_db()

    existing_user = await db.users.find_one({
        "email": user["email"]
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(
        user["password"]
    )

    user_doc = {
        "name": user["name"],
        "email": user["email"],
        "password": hashed_password,
        "dark_mode": False,
        "created_at": datetime.utcnow()
    }

    result = await db.users.insert_one(
        user_doc
    )

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }

# Login
@router.post("/login")
async def login(user: dict):

    db = get_db()

    existing_user = await db.users.find_one({
        "email": user["email"]
    })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    valid_password = verify_password(
        user["password"],
        existing_user["password"]
    )

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token({
        "user_id": str(existing_user["_id"]),
        "email": existing_user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "name": existing_user["name"],
        "email": existing_user["email"],
        "dark_mode": existing_user.get(
            "dark_mode",
            False
        )
    }

