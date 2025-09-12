from rest_framework import permissions

class IsAuthenticatedOrReadOnlyForList(permissions.BasePermission):
    """
    Allows unauthenticated access to the list view (GET),
    but requires authentication for creation (POST).
    """
    def has_permission(self, request, view):
        # Allow all GET requests for the list view.
        if request.method == 'GET':
            return True
        # Check for authentication for all other methods (e.g., POST).
        return request.user and request.user.is_authenticated

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of an object to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the author of the post.
        return obj.author == request.user 