import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from .models import Message
from users.serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_name = self.scope['url_route']['kwargs']['room_name']
            self.room_group_name = f'chat_{self.room_name}'
            
            # Authentication
            token = self.scope['query_string'].decode().split('=')[1]
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            self.scope['user'] = await database_sync_to_async(User.objects.get)(id=user_id)

            if not self.scope['user'].is_authenticated:
                await self.close()
                return

            await self.channel_layer.group_add( # type: ignore
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard( # type: ignore
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json['message']
        
        message = await self.save_message(self.scope['user'], self.room_name, message_content)
        
        await self.channel_layer.group_send( # type: ignore
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def save_message(self, sender, room, content):
        # The room name is "userid1_userid2". We need to find the other user's ID.
        user_ids = room.split('_')
        recipient_id = user_ids[0] if user_ids[1] == str(sender.id) else user_ids[1]
        
        recipient = User.objects.get(id=int(recipient_id))
        
        msg = Message.objects.create( # type: ignore
            sender=sender,
            receiver=recipient,
            content=content
        )
        
        # We need to serialize the message to send it over the websocket
        # Note: This runs in a sync context because of database_sync_to_async
        # so we can call the serializer synchronously.
        serializer = MessageSerializer(msg)
        return serializer.data 