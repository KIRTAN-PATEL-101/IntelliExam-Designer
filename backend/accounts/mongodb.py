# accounts/mongodb.py

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
mongo_db = client["intelliexam"]  # Choose a name
users_collection = mongo_db["users"]
