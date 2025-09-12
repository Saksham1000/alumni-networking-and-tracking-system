from rest_framework import serializers
from .models import User, Post, Message, ConnectionRequest, PostComment, PostLike, Notification, Endorsement, Recommendation, Report, PostCommentLike
from django.contrib.auth.password_validation import validate_password
import re
import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role', 'phone')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        phone = attrs.get('phone')
        if phone:
            if len(phone) > 20:
                raise serializers.ValidationError({"phone": "Phone number must be at most 20 characters."})
            if not re.match(r'^(97|98)\d{8}$', phone):
                raise serializers.ValidationError({"phone": "Phone must start with 97 or 98 and be exactly 10 digits."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role'],
            phone=validated_data.get('phone', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone', 
                  'graduation_year', 'skills', 'job_title', 'company', 'bio', 'profile_picture',
                  'location', 'experience', 'education', 'linkedin', 'github', 'twitter', 'website')
        read_only_fields = ('role', 'id')


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')


class PostCommentSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    class Meta:
        model = PostComment
        fields = ('id', 'user', 'content', 'created_at')


class PostLikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = PostLike
        fields = ('id', 'user', 'created_at')


class PostSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    comments = PostCommentSerializer(many=True, read_only=True)
    like_count = serializers.SerializerMethodField()
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author', 'content', 'image', 'created_at', 'comments', 'like_count', 'liked_by_user')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if getattr(instance, 'image', None):
            request = self.context.get('request')
            try:
                data['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
            except Exception:
                data['image'] = instance.image.url
        else:
            data['image'] = None
        return data

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_liked_by_user(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated:
            return obj.likes.filter(user=user).exists()
        return False


class MessageSerializer(serializers.ModelSerializer):
    sender = UserProfileSerializer(read_only=True)
    receiver = UserProfileSerializer(read_only=True)
    class Meta:
        model = Message
        fields = ('id', 'sender', 'receiver', 'content', 'timestamp', 'read')


class ConnectionRequestSerializer(serializers.ModelSerializer):
    from_user = UserProfileSerializer(read_only=True)
    to_user = UserProfileSerializer(read_only=True)
    to_user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='to_user', write_only=True)
    from_user_username = serializers.CharField(source='from_user.username', read_only=True)
    to_user_username = serializers.CharField(source='to_user.username', read_only=True)
    
    class Meta:
        model = ConnectionRequest
        fields = ('id', 'from_user', 'to_user', 'to_user_id', 'status', 'created_at', 'from_user_username', 'to_user_username')
        read_only_fields = ('from_user', 'status', 'created_at')

    def create(self, validated_data):
        return ConnectionRequest.objects.create(**validated_data) # type: ignore


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'role': {'read_only': True},
            'groups': {'read_only': True},
            'user_permissions': {'read_only': True},
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'graduation_year': {'required': False, 'allow_null': True},
            'skills': {'required': False, 'allow_blank': True, 'allow_null': True},
            'job_title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'company': {'required': False, 'allow_blank': True, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True, 'allow_null': True},
            'profile_picture': {'required': False, 'allow_null': True},
            'location': {'required': False, 'allow_blank': True, 'allow_null': True},
            'experience': {'required': False, 'allow_blank': True, 'allow_null': True},
            'education': {'required': False, 'allow_blank': True, 'allow_null': True},
            'linkedin': {'required': False, 'allow_blank': True, 'allow_null': True},
            'github': {'required': False, 'allow_blank': True, 'allow_null': True},
            'twitter': {'required': False, 'allow_blank': True, 'allow_null': True},
            'website': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate_phone(self, value):
        if value and value.strip():
            if len(value) > 20:
                raise serializers.ValidationError("Phone number must be at most 20 characters.")
            if not re.match(r'^(97|98)\d{8}$', value):
                raise serializers.ValidationError("Phone must start with 97 or 98 and be exactly 10 digits.")
        return value

    def validate_graduation_year(self, value):
        if value is not None:
            current_year = datetime.datetime.now().year
            if value < 1900 or value > current_year + 10:
                raise serializers.ValidationError(f"Graduation year must be between 1900 and {current_year + 10}.")
        return value

    def update(self, instance, validated_data):
        if 'profile_picture' in validated_data and not validated_data['profile_picture']:
            instance.profile_picture.delete(save=False)
            validated_data['profile_picture'] = None
        return super().update(instance, validated_data)


# ===================== Updated PublicProfileSerializer =====================
class PublicProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'first_name', 'last_name', 'role', 'profile_picture',
            'email',        # added
            'skills', 'job_title', 'company', 'bio', 'graduation_year', 'location',
            'experience',   # added
            'education',    # added
            'linkedin', 'github', 'twitter', 'website'
        )

    def get_profile_picture(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            try:
                return request.build_absolute_uri(obj.profile_picture.url) if request else obj.profile_picture.url
            except Exception:
                return obj.profile_picture.url
        return None


# ===================== JWT Serializer =====================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user is not None:
            if not self.user.is_active:
                raise AuthenticationFailed('User account is disabled.')
            if hasattr(self.user, 'approved') and not self.user.approved:
                raise AuthenticationFailed('User account is not approved by admin.')
        return data


# ===================== Notifications, Endorsements, Recommendations, Reports =====================
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'message', 'link', 'read', 'created_at')


class EndorsementSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    endorsed_user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Endorsement
        fields = ['id', 'user', 'endorsed_user', 'skill', 'created_at']


class RecommendationSerializer(serializers.ModelSerializer):
    from_user = serializers.StringRelatedField(read_only=True)
    to_user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'from_user', 'to_user', 'text', 'created_at']


class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.StringRelatedField(read_only=True)
    resolved_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Report
        fields = ['id', 'reporter', 'content_type', 'object_id', 'reason', 'status', 'created_at', 'resolved_by', 'resolution_notes']


class PostCommentLikeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    comment = serializers.PrimaryKeyRelatedField(queryset=PostComment.objects.all())
    class Meta:
        model = PostCommentLike
        fields = ['id', 'comment', 'user', 'created_at']
