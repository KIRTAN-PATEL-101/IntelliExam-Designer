from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'password',
            'user_type',
            'institution'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_user_type(self, value):
        valid_choices = ['admin', 'professor']
        if value not in valid_choices:
            raise serializers.ValidationError(f"user_type must be one of: {valid_choices}")
        return value

    def create(self, validated_data):
        print("Validated data:", validated_data)
        print("Request data: ")
        print("User type from validated_data:", validated_data.get('user_type'))


        # !!! Pop user_type so it doesn’t get passed twice
        user_type = validated_data.pop('user_type', 'professor')
        print("Extracted user_type:", user_type)

        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
            user_type=user_type,   # !!! Explicitly set once
            institution=validated_data.get('institution', '')
        )

        print("Created Django user with user_type:", user.user_type)

        return user
