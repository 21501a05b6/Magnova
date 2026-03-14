import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('backend/.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

async def run():
    docs = await db.admin_approvals.find().to_list(100)
    print("ALL ADMIN APPROVALS:")
    for d in docs:
        print(f"- {d['email']} | {d.get('status')}")

    users = await db.users.find({"role": "Admin"}).to_list(100)
    print("\nALL ADMIN USERS:")
    for u in users:
        print(f"- {u['email']} | {u.get('role')}")

asyncio.run(run())
