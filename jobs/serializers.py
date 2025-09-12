from rest_framework import serializers
from .models import JobPost, Comment, JobPostLike
from users.serializers import UserProfileSerializer

class CommentSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']

class JobPostLikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = JobPostLike
        fields = ('id', 'user', 'created_at')

class JobPostSerializer(serializers.ModelSerializer):
    created_by = UserProfileSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = JobPost
        fields = ['id', 'title', 'description', 'company', 'link', 'created_by', 'created_at', 'comments', 'like_count', 'liked_by_user']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_liked_by_user(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None # type: ignore 
        if user and user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False

class JobPostCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPost
        fields = ['title', 'description', 'company', 'link'] 