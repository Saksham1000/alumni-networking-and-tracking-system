from django.urls import path
from .views import EventListCreateView, EventRetrieveUpdateDestroyView, RSVPEventView, public_events

urlpatterns = [
    path('', EventListCreateView.as_view(), name='event-list-create'),
    path('<int:pk>/', EventRetrieveUpdateDestroyView.as_view(), name='event-detail'),
    path('<int:pk>/rsvp/', RSVPEventView.as_view(), name='event-rsvp'),
]

urlpatterns += [
    path('public/', public_events, name='public-events'),
] 