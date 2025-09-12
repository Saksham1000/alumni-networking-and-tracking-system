from django.core.management.base import BaseCommand, CommandError
from users.models import User, ConnectionRequest

class Command(BaseCommand):
    help = 'List all pending connection requests for a given username (as recipient/to_user)'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the recipient user')

    def handle(self, *args, **options):
        username = options['username']
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:  #type: ignore 
            raise CommandError(f'User with username "{username}" does not exist.')

        pending = ConnectionRequest.objects.filter(to_user=user, status='pending') #type: ignore 
        if not pending:
            self.stdout.write(self.style.WARNING(f'No pending requests for {username}')) #type: ignore 
            return
        self.stdout.write(self.style.SUCCESS(f'Pending requests for {username}:')) #type: ignore 
        for req in pending:
            self.stdout.write(f'From: {req.from_user.username} (id={req.from_user.id}), Status: {req.status}, Created: {req.created_at}') 