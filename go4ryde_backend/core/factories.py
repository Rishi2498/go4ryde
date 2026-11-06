import factory
from django.contrib.auth import get_user_model
from django.utils import timezone

from rides.models import Ride
from chat.models import ChatRoom


User = get_user_model()


# =========================
# 👤 USER FACTORY
# =========================
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@test.com")
    phone = factory.Sequence(lambda n: f"90000000{n:02}")
    role = "PASSENGER"

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        password = extracted or "password123"
        self.set_password(password)
        self.save()

# =========================
# 🚗 RIDE FACTORY
# =========================
class RideFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Ride

    driver = factory.SubFactory(UserFactory)

    source = "A"
    source_lat = 17.3850
    source_lng = 78.4867

    destination = "B"
    destination_lat = 17.4875
    destination_lng = 78.3997

    date_time = factory.LazyFunction(timezone.now)

    price_per_seat = 100

    seats_available = 3

# =========================
# 💬 CHAT ROOM FACTORY
# =========================
class ChatRoomFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ChatRoom

    ride = factory.SubFactory(RideFactory)

    @factory.post_generation
    def participants(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            # If users passed explicitly
            for user in extracted:
                self.participants.add(user)
        else:
            # Default: create 2 users
            self.participants.add(UserFactory(), UserFactory())