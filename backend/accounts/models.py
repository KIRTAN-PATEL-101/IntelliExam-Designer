from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and return a user with email and password.
        """
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)

        # ✅ Always preserve user_type or default to professor
        user_type = extra_fields.pop("user_type", "professor")
        extra_fields["user_type"] = user_type
        
        user = self.model(email=email, **extra_fields)  # !!! don’t pass user_type twice

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # ✅ Force user_type=admin for superusers
        extra_fields.setdefault("user_type", "admin")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ("admin", "Admin"),
        ("professor", "Professor"),
    )

    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default="professor"
    )
    institution = models.CharField(max_length=255, blank=True, null=True)

    # Django permissions integration
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)  # ✅ Explicit field

    # Manager
    objects = UserManager()

    # Login with email instead of username
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # removes username requirement for superuser

    def __str__(self):
        return self.email
