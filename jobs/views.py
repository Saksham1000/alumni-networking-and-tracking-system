from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import JobPost, Comment, JobPostLike
from users.models import User
from .serializers import JobPostSerializer, JobPostCreateUpdateSerializer, CommentSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.

class IsAlumniOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'alumni'

class JobPostListCreateView(generics.ListCreateAPIView):
    queryset = JobPost.objects.all().order_by('-created_at')  # type: ignore
    serializer_class = JobPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobPostCreateUpdateSerializer
        return JobPostSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class JobPostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.all()  # type: ignore
    serializer_class = JobPostSerializer
    permission_classes = [IsAlumniOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobPostCreateUpdateSerializer
        return JobPostSerializer

class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        serializer.save(user=self.request.user, post_id=post_id)

class CommentDeleteView(generics.DestroyAPIView):
    queryset = Comment.objects.all()  # type: ignore
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        comment = self.get_object()
        if comment.user != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        return super().delete(request, *args, **kwargs)

@api_view(['GET'])
@permission_classes([AllowAny])
def public_jobs(request):
    jobs = JobPost.objects.order_by('-created_at')[:10] # type: ignore
    return Response(JobPostSerializer(jobs, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_job_post(request, job_id):
    try:
        job_post = JobPost.objects.get(id=job_id)
    except ObjectDoesNotExist:
        return Response({'detail': 'Job post not found.'}, status=404)
    like, created = JobPostLike.objects.get_or_create(job_post=job_post, user=request.user)
    if not created:
        like.delete()
        return Response({'liked': False, 'like_count': job_post.likes.count()})
    return Response({'liked': True, 'like_count': job_post.likes.count()})
