from pymongo import MongoClient

MONGO_URI = "mongodb+srv://rosemariyajoe89_db_user:YOUR_PASSWORD@nowais.awssauo.mongodb.net/?appName=Nowais"

client = MongoClient(MONGO_URI)

db = client["async_nexus"]
collection = db["decisions"]

collection.insert_one({
    "decision": "Use React",
    "reason": "Large ecosystem"
})

print("Inserted")