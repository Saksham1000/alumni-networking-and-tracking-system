from django.shortcuts import render
from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Event
from users.models import User
from .serializers import EventSerializer, EventCreateUpdateSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import datetime
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Create your views here.

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'admin'

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all().order_by('-date')  # type: ignore
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date', 'title', 'location']
    ordering = ['-date']
    pagination_class = None  # Use default pagination from settings or set PageNumberPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateUpdateSerializer
        return EventSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()  # type: ignore
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateUpdateSerializer
        return EventSerializer

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

        # --- AUDIENCE RESTRICTION LOGIC ---
        user_role = request.user.role
        if event.audience != 'both' and event.audience != user_role:
            return Response({'detail': f'Only {event.audience}s can RSVP to this event.'}, status=status.HTTP_403_FORBIDDEN)
        # -----------------------------------

        status_value = request.data.get('status', 'going')
        if status_value == 'going':
            event.attendees.add(request.user)
            return Response({'detail': 'Marked as going.'})
        elif status_value == 'not going':
            event.attendees.remove(request.user)
            return Response({'detail': 'Marked as not going.'})
        else:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)  # type: ignore
        except Event.DoesNotExist:  # type: ignore
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        event.attendees.remove(request.user)
        return Response({'detail': 'RSVP removed.'})

@api_view(['GET'])
@permission_classes([AllowAny])
def public_events(request):
    now = datetime.datetime.now()
    events = Event.objects.filter(date__gte=now).order_by('date')[:10] # type: ignore
    return Response(EventSerializer(events, many=True).data)
