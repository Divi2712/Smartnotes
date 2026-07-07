from bson import ObjectId
from database.mongodb import get_db


async def get_dashboard(user_id: str) -> dict:
    db = get_db()
    uid = ObjectId(user_id)

    # Counts
    total_uploads = await db.files.count_documents({"user_id": uid})
    total_notes = await db.notes.count_documents({"user_id": uid})

    # Total storage used (sum of file sizes in bytes → MB)
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": None, "total_bytes": {"$sum": "$file_size"}}},
    ]
    storage_result = await db.files.aggregate(pipeline).to_list(1)
    total_bytes = storage_result[0]["total_bytes"] if storage_result else 0
    storage_used_mb = round(total_bytes / (1024 * 1024), 2)

    # Storage breakdown by category
    category_pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$file_type", "size": {"$sum": "$file_size"}, "count": {"$sum": 1}}},
    ]
    category_results = await db.files.aggregate(category_pipeline).to_list(20)
    storage_by_category = {
        r["_id"]: {
            "size_mb": round(r["size"] / (1024 * 1024), 2),
            "count": r["count"],
        }
        for r in category_results
    }

    # Recent 10 activities (latest uploads + latest notes)
    recent_files_cursor = (
        db.files.find({"user_id": uid})
        .sort("upload_date", -1)
        .limit(5)
    )
    recent_files = await recent_files_cursor.to_list(5)

    recent_notes_cursor = (
        db.notes.find({"user_id": uid})
        .sort("updated_at", -1)
        .limit(5)
    )
    recent_notes = await recent_notes_cursor.to_list(5)

    activities = []
    for f in recent_files:
        activities.append({
            "type": "upload",
            "id": str(f["_id"]),
            "name": f["file_name"],
            "file_type": f["file_type"],
            "date": f["upload_date"].isoformat(),
            "status": f["status"],
        })
    for n in recent_notes:
        activities.append({
            "type": "note",
            "id": str(n["_id"]),
            "name": n["title"],
            "date": n["updated_at"].isoformat(),
        })

    # Sort activities by date desc
    activities.sort(key=lambda x: x["date"], reverse=True)

    return {
        "total_uploads": total_uploads,
        "total_notes": total_notes,
        "storage_used_mb": storage_used_mb,
        "storage_by_category": storage_by_category,
        "recent_activities": activities[:10],
    }
