from django.shortcuts import render
from rest_framework import generics, permissions, filters, status, viewsets
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Post, Message, ConnectionRequest, PostComment, PostLike, Notification, Endorsement, Recommendation, Report, PostCommentLike
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    ConnectionRequestSerializer,
    MessageSerializer,
    PostSerializer,
    PublicProfileSerializer,
    MyTokenObtainPairSerializer,
    PostCommentSerializer,
    NotificationSerializer,
    EndorsementSerializer,
    RecommendationSerializer,
    ReportSerializer,
    PostCommentLikeSerializer,
)
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from .recommendation import recommend_alumni_enhanced_cosine
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .serializers import PublicProfileSerializer
from events.models import Event
from events.serializers import EventSerializer, EventCreateUpdateSerializer
from django.db.models import Q, Case, When
from rest_framework.decorators import action
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from jobs.models import JobPost
from .permissions import IsAuthorOrReadOnly, IsAuthenticatedOrReadOnlyForList
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.core.exceptions import ObjectDoesNotExist
from django.urls import reverse
from rest_framework.views import APIView
import datetime


User = get_user_model()

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = (permissions.AllowAny,)

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

class PublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = PublicProfileSerializer
    permission_classes = [permissions.AllowAny]

class AlumniSearchView(generics.ListAPIView):
    serializer_class = PublicProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = User.objects.filter(role='alumni', approved=True)
        query = self.request.query_params.get('q', '')
        if query:
            queryset = queryset.filter(
                Q(username__icontains=query) | # type: ignore
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(skills__icontains=query) |
                Q(company__icontains=query)
            )
        return queryset

class GlobalSearch(generics.ListAPIView):
    serializer_class = PublicProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return User.objects.none()
        
        return User.objects.filter(
            Q(role__in=['alumni', 'student']) & Q(approved=True) &
            (
                Q(username__icontains=query) | # type: ignore
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(skills__icontains=query) |
                Q(company__icontains=query) |
                Q(job_title__icontains=query)
            )
        ).distinct()

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at') # type: ignore
    serializer_class = PostSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [permissions.AllowAny()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAuthorOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ConnectionRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ConnectionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ConnectionRequest.objects.filter( # type: ignore 
            Q(from_user=self.request.user) | Q(to_user=self.request.user) # type: ignore
        )

    def perform_create(self, serializer):
        to_user = serializer.validated_data['to_user']
        if self.request.user == to_user:
            return Response("You cannot send a connection request to yourself.", status=status.HTTP_400_BAD_REQUEST)
        if ConnectionRequest.objects.filter(from_user=self.request.user, to_user=to_user).exists(): # type: ignore      
            return Response("Connection request already sent.", status=status.HTTP_400_BAD_REQUEST)
        instance = serializer.save(from_user=self.request.user)
        Notification.objects.create(
            user=to_user,
            message=f"{self.request.user.username} sent you a connection request.",
            link=f"/profile/{self.request.user.id}"
        )
        return instance

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        connection_request = self.get_object()
        if connection_request.to_user != request.user:
            return Response({'status': 'unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        connection_request.status = 'accepted'
        connection_request.save()
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        connection_request = self.get_object()
        if connection_request.to_user != request.user:
            return Response({'status': 'unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        connection_request.status = 'rejected'
        connection_request.save()
        return Response({'status': 'rejected'})

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('-timestamp') # type: ignore  

    def perform_create(self, serializer):
        msg = serializer.save(sender=self.request.user)
        if msg.receiver != self.request.user:
            Notification.objects.create(
                user=msg.receiver,
                message=f"{self.request.user.username} sent you a message.",
                link=f"/messages"
            )

    @action(detail=False, methods=['get'], url_path='with/(?P<user_id>[^/.]+)')
    def with_user(self, request, user_id=None):
        user = request.user
        other_user = User.objects.get(id=user_id)
        messages = Message.objects.filter(
            (Q(sender=user) & Q(receiver=other_user)) |
            (Q(sender=other_user) & Q(receiver=user))
        ).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_alumni(request):
    from .models import User
    alumni = User.objects.filter(role='alumni', approved=True).order_by('-date_joined')[:10] # type: ignore 
    from .serializers import PublicProfileSerializer
    return Response(PublicProfileSerializer(alumni, many=True, context={'request': request}).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_profile(request, id):
    from .models import User
    try:
        user = User.objects.get(id=id, approved=True)
    except Exception:
        return Response({'detail': 'Not found'}, status=404)
    from .serializers import PublicProfileSerializer
    return Response(PublicProfileSerializer(user, context={'request': request}).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def user_posts(request, id):
    from .models import Post, User
    from .serializers import PostSerializer
    try:
        user = User.objects.get(id=id, approved=True)
    except Exception:
        return Response({'detail': 'Not found'}, status=404)
    posts = Post.objects.filter(author=user).order_by('-created_at') # type: ignore
    return Response(PostSerializer(posts, many=True, context={'request': request}).data)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def public_feed(request):
    if request.method == 'GET':
        posts = Post.objects.all().order_by('-created_at') # type: ignore
        return Response(PostSerializer(posts, many=True, context={'request': request}).data)
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=401)
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    total_alumni = User.objects.filter(role='alumni', approved=True).count()
    total_students = User.objects.filter(role='student', approved=True).count()
    now = datetime.datetime.now()
    total_events = Event.objects.filter(date__gte=now).count() # type: ignore
    total_jobs = JobPost.objects.count() # type: ignore 
    return Response({
        'total_alumni': total_alumni,
        'total_students': total_students,
        'total_events': total_events,
        'total_jobs': total_jobs,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'email': 'Email is required.'}, status=400)
    try:
        user = User.objects.get(email=email)
    except ObjectDoesNotExist:
        return Response({'email': 'No user with this email.'}, status=404)
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"http://localhost:3000/reset-password?uid={uid}&token={token}"
    return Response({'detail': 'Password reset link sent (check console in dev).'}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    if not (uidb64 and token and new_password):
        return Response({'detail': 'uid, token, and new_password are required.'}, status=400)
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, ObjectDoesNotExist):
        return Response({'detail': 'Invalid user.'}, status=400)
    if not default_token_generator.check_token(user, token):
        return Response({'detail': 'Invalid or expired token.'}, status=400)
    user.set_password(new_password)
    user.save()
    return Response({'detail': 'Password has been reset successfully.'}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except ObjectDoesNotExist:
        return Response({'detail': 'Post not found.'}, status=404)
    like, created = PostLike.objects.get_or_create(post=post, user=request.user)
    if not created:
        like.delete()
        return Response({'liked': False, 'like_count': post.likes.count()})
    if post.author.id != request.user.id:
        Notification.objects.create(
            user=post.author,
            message=f"{request.user.username} liked your post.",
            link=f"/profile/{post.author.id}"
        )
    return Response({'liked': True, 'like_count': post.likes.count()})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_post_comment(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except ObjectDoesNotExist:
        return Response({'detail': 'Post not found.'}, status=404)
    content = request.data.get('content')
    if not content:
        return Response({'content': 'Content is required.'}, status=400)
    comment = PostComment.objects.create(post=post, user=request.user, content=content)
    if post.author != request.user:
        Notification.objects.create(
            user=post.author,
            message=f"{request.user.username} commented on your post.",
            link=f"/posts/{post.id}#comment-{comment.id}"
        )
    return Response(PostCommentSerializer(comment).data, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post_comment(request, comment_id):
    try:
        comment = PostComment.objects.get(id=comment_id)
    except ObjectDoesNotExist:
        return Response({'detail': 'Comment not found.'}, status=404)
    if comment.user.id != request.user.id:
        return Response({'detail': 'Not allowed.'}, status=403)
    comment.delete()
    return Response({'detail': 'Comment deleted.'})

@api_view(['GET'])
@permission_classes([AllowAny])
def list_post_comments(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except ObjectDoesNotExist:
        return Response({'detail': 'Post not found.'}, status=404)
    comments = post.comments.all().order_by('created_at')
    return Response(PostCommentSerializer(comments, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    unread = request.query_params.get('unread')
    qs = Notification.objects.filter(user=request.user)
    if unread:
        qs = qs.filter(read=False)
    qs = qs.order_by('-created_at')[:50]
    return Response(NotificationSerializer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        notif = Notification.objects.get(id=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification not found.'}, status=404)
    notif.read = True
    notif.save()
    return Response({'detail': 'Notification marked as read.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'detail': 'All notifications marked as read.'})

class RSVPEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)  # type: ignore
        except Event.DoesNotExist:  # type: ignore
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        now = datetime.datetime.now(datetime.timezone.utc)
        if event.date < now:
            return Response({'detail': 'Cannot RSVP to an outdated event.'}, status=status.HTTP_400_BAD_REQUEST)
        status_value = request.data.get('status', 'going')
        if status_value == 'going':
            event.attendees.add(request.user)
            if event.created_by != request.user:
                Notification.objects.create(
                    user=event.created_by,
                    message=f"{request.user.username} is going to your event '{event.title}'.",
                    link=f"/events"
                )
            return Response({'detail': 'Marked as going.'})
        elif status_value == 'not going':
            event.attendees.remove(request.user)
            return Response({'detail': 'Marked as not going.'})
        else:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def endorse_skill(request, user_id):
    skill = request.data.get('skill')
    if not skill:
        return Response({'detail': 'Skill is required.'}, status=400)
    try:
        endorsed_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=404)
    if request.method == 'POST':
        if Endorsement.objects.filter(user=request.user, endorsed_user=endorsed_user, skill=skill).exists():
            return Response({'detail': 'Already endorsed.'}, status=400)
        endorsement = Endorsement.objects.create(user=request.user, endorsed_user=endorsed_user, skill=skill)
        return Response(EndorsementSerializer(endorsement).data, status=201)
    else:  # DELETE
        Endorsement.objects.filter(user=request.user, endorsed_user=endorsed_user, skill=skill).delete()
        return Response({'detail': 'Endorsement removed.'})

@api_view(['GET'])
@permission_classes([AllowAny])
def list_endorsements(request, user_id):
    endorsements = Endorsement.objects.filter(endorsed_user_id=user_id)
    return Response(EndorsementSerializer(endorsements, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_recommendation(request, user_id):
    text = request.data.get('text')
    if not text:
        return Response({'detail': 'Text is required.'}, status=400)
    try:
        to_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=404)
    rec = Recommendation.objects.create(from_user=request.user, to_user=to_user, text=text)
    return Response(RecommendationSerializer(rec).data, status=201)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_recommendations(request, user_id):
    recs = Recommendation.objects.filter(to_user_id=user_id).order_by('-created_at')
    return Response(RecommendationSerializer(recs, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_content(request):
    content_type = request.data.get('content_type')
    object_id = request.data.get('object_id')
    reason = request.data.get('reason')
    if content_type not in ['post', 'comment'] or not object_id or not reason:
        return Response({'detail': 'Invalid data.'}, status=400)
    report = Report.objects.create(
        reporter=request.user,
        content_type=content_type,
        object_id=object_id,
        reason=reason
    )
    return Response(ReportSerializer(report).data, status=201)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_reports(request):
    status_filter = request.query_params.get('status')
    qs = Report.objects.all().order_by('-created_at')
    if status_filter:
        qs = qs.filter(status=status_filter)
    return Response(ReportSerializer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def resolve_report(request, report_id):
    try:
        report = Report.objects.get(id=report_id)
    except Report.DoesNotExist:
        return Response({'detail': 'Report not found.'}, status=404)
    notes = request.data.get('resolution_notes', '')
    report.status = 'resolved'
    report.resolved_by = request.user
    report.resolution_notes = notes
    report.save()
    return Response(ReportSerializer(report).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_connections(request):
    user = request.user
    connections = ConnectionRequest.objects.filter(
        (Q(from_user=user) | Q(to_user=user)) & Q(status='accepted')
    )
    connected_users = []
    for conn in connections:
        if conn.from_user == user:
            connected_users.append(conn.to_user)
        else:
            connected_users.append(conn.from_user)
    connected_users = list({u.id: u for u in connected_users}.values())
    connected_users = [u for u in connected_users if u.id != user.id]
    from .serializers import PublicProfileSerializer
    return Response(PublicProfileSerializer(connected_users, many=True).data)

@api_view(['POST', 'DELETE', 'GET'])
@permission_classes([IsAuthenticated])
def comment_like(request, comment_id):
    try:
        comment = PostComment.objects.get(id=comment_id)
    except PostComment.DoesNotExist:
        return Response({'detail': 'Comment not found.'}, status=404)
    user = request.user
    if request.method == 'POST':
        like, created = PostCommentLike.objects.get_or_create(comment=comment, user=user)
        if created:
            return Response({'detail': 'Comment liked.'}, status=201)
        return Response({'detail': 'Already liked.'}, status=200)
    elif request.method == 'DELETE':
        deleted, _ = PostCommentLike.objects.filter(comment=comment, user=user).delete()
        if deleted:
            return Response({'detail': 'Comment unliked.'}, status=200)
        return Response({'detail': 'Not previously liked.'}, status=400)
    else:
        count = PostCommentLike.objects.filter(comment=comment).count()
        liked = PostCommentLike.objects.filter(comment=comment, user=user).exists()
        return Response({'count': count, 'liked': liked})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_message_count(request):
    user = request.user
    from .models import Message
    count = Message.objects.filter(receiver=user, read=False).count()
    return Response({'unread_count': count})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, user_id):
    user = request.user
    from .models import Message
    Message.objects.filter(sender_id=user_id, receiver=user, read=False).update(read=True)
    return Response({'detail': 'Messages marked as read.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommendations(request):
    """API endpoint for getting alumni recommendations using enhanced cosine similarity with semantic understanding"""
    user = request.user
    try:
        alumni = User.objects.filter(role='alumni', approved=True).exclude(id=user.id)
        recommended = recommend_alumni_enhanced_cosine(user, alumni, k=5)
        return Response(PublicProfileSerializer(recommended, many=True).data)
    except Exception as e:
        return Response({'detail': f'Error: {str(e)}'}, status=500)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """Comprehensive admin dashboard with analytics and insights"""
    try:
        # Basic counts
        total_alumni = User.objects.filter(role='alumni', approved=True).count()
        total_students = User.objects.filter(role='student', approved=True).count()
        total_pending = User.objects.filter(approved=False).count()
        total_events = Event.objects.count()
        total_rsvps = Event.objects.aggregate(total=Count('rsvps'))['total'] or 0
        
        # User registration trends (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        user_trend = []
        for i in range(30):
            date = thirty_days_ago + timedelta(days=i)
            next_date = date + timedelta(days=1)
            count = User.objects.filter(
                date_joined__gte=date,
                date_joined__lt=next_date
            ).count()
            user_trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # Event RSVP trends (last 30 days)
        rsvp_trend = []
        for i in range(30):
            date = thirty_days_ago + timedelta(days=i)
            next_date = date + timedelta(days=1)
            count = Event.objects.filter(
                date__gte=date,
                date__lt=next_date
            ).aggregate(total=Count('rsvps'))['total'] or 0
            rsvp_trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # Skills analytics
        skills_data = User.objects.filter(
            role='alumni', 
            approved=True,
            skills__isnull=False
        ).values('skills').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Company analytics
        company_data = User.objects.filter(
            role='alumni',
            approved=True,
            company__isnull=False
        ).values('company').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Connection analytics
        total_connections = ConnectionRequest.objects.filter(status='accepted').count()
        pending_connections = ConnectionRequest.objects.filter(status='pending').count()
        
        # Post analytics
        total_posts = Post.objects.count()
        total_likes = Post.objects.aggregate(total=Count('likes'))['total'] or 0
        
        # Recent activity (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        recent_registrations = User.objects.filter(date_joined__gte=seven_days_ago).count()
        recent_posts = Post.objects.filter(created_at__gte=seven_days_ago).count()
        recent_events = Event.objects.filter(created_at__gte=seven_days_ago).count()
        
        return Response({
            'total_alumni': total_alumni,
            'total_students': total_students,
            'total_pending': total_pending,
            'total_events': total_events,
            'total_rsvps': total_rsvps,
            'total_connections': total_connections,
            'pending_connections': pending_connections,
            'total_posts': total_posts,
            'total_likes': total_likes,
            'user_trend': user_trend,
            'rsvp_trend': rsvp_trend,
            'skills_data': list(skills_data),
            'company_data': list(company_data),
            'recent_activity': {
                'registrations': recent_registrations,
                'posts': recent_posts,
                'events': recent_events
            }
        })
    except Exception as e:
        return Response({'detail': f'Error: {str(e)}'}, status=500)
