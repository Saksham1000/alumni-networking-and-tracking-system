from django.db import models
from users.models import User

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    attendees = models.ManyToManyField(User, related_name='attending_events', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    AUDIENCE_CHOICES = [
        ('alumni', 'Alumni'),
        ('student', 'Student'),
        ('both', 'Both'),
    ]
    audience = models.CharField(max_length=10, choices=AUDIENCE_CHOICES, default='both')

    def __str__(self):
        return self.title
