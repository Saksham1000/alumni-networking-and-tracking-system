from django.urls import path
from .views import JobPostListCreateView, JobPostRetrieveUpdateDestroyView, CommentCreateView, CommentDeleteView, public_jobs, like_job_post

urlpatterns = [
    path('', JobPostListCreateView.as_view(), name='jobpost-list-create'),
    path('<int:pk>/', JobPostRetrieveUpdateDestroyView.as_view(), name='jobpost-detail'),
    path('<int:post_id>/comments/', CommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:pk>/', CommentDeleteView.as_view(), name='comment-delete'),
]

urlpatterns += [
    path('public/', public_jobs, name='public-jobs'),
]

urlpatterns += [
    path('<int:job_id>/like/', like_job_post, name='like-job-post'),
] 