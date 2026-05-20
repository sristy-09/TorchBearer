"""
One-time migration: add tags:[] to all existing spaces that don't have the field.
Run once: py migrate_tags.py
"""
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME", "test")]

result = db["spaces"].update_many(
    {"tags": {"$exists": False}},
    {"$set": {"tags": []}}
)

print(f"Backfilled tags on {result.modified_count} spaces.")
client.close()
