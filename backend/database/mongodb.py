from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, TEXT
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ai_notes_db")

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    await create_indexes()
    print(f"✅ Connected to MongoDB: {DATABASE_NAME}")


async def close_db():
    global client
    if client:
        client.close()
        print("🔴 MongoDB connection closed")


async def create_indexes():
    # Users
    await db.users.create_index([("email", ASCENDING)], unique=True)

    # Files
    await db.files.create_index([("user_id", ASCENDING)])
    await db.files.create_index([("upload_date", ASCENDING)])
    await db.files.create_index([("file_type", ASCENDING)])

    # Notes
    await db.notes.create_index([("user_id", ASCENDING)])
    await db.notes.create_index([("created_at", ASCENDING)])
    await db.notes.create_index([("title", TEXT), ("original_content", TEXT)])

    print("✅ MongoDB indexes created")


def get_db():
    return db
