# accounts/mongo_models.py
from mongoengine import Document, StringField, IntField

class CustomUser(Document):
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    email = StringField(required=True, unique=True)
    institution = StringField()
    django_user_id = IntField(required=True)
    user_type = StringField(choices=["admin", "professor"], default="professor")
    credits = IntField(default=10)
    co_po_mapping = StringField()  # store JSON string or structure later
