from django.apps import AppConfig


class EventsConfig(AppConfig):
    @property
    def default_auto_field(self):
        return 'django.db.models.BigAutoField'
    name = 'events'
