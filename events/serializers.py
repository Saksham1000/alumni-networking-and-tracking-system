from rest_framework import serializers
from .models import Event
from users.serializers import UserProfileSerializer

class EventSerializer(serializers.ModelSerializer):
    created_by = UserProfileSerializer(read_only=True)
    attendees = UserProfileSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = '__all__'

class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('title', 'description', 'date', 'location') 