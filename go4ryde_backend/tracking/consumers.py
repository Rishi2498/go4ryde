import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ride_id = self.scope['url_route']['kwargs']['ride_id']
        self.room_group_name = f'ride_{self.ride_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        lat = text_data_json['lat']
        lng = text_data_json['lng']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'location_message',
                'lat': lat,
                'lng': lng
            }
        )

    # Receive message from room group
    async def location_message(self, event):
        lat = event['lat']
        lng = event['lng']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'lat': lat,
            'lng': lng
        }))
