import math
from datetime import timedelta

from rest_framework import generics, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_datetime

from .models import Ride, Review
from .serializers import RideSerializer, ReviewSerializer
from accounts.models import DriverProfile
from .forms import SearchRideForm


# --------------- Haversine helper ---------------

def calculate_distance(lat1, lon1, lat2, lon2):
    """Return distance between two points in kilometres using the Haversine formula."""
    R = 6371  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# --------------- Ride views ---------------

class CreateRideView(generics.CreateAPIView):
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        try:
            driver_profile = user.driver_profile
        except DriverProfile.DoesNotExist:
            raise serializers.ValidationError("Only registered drivers can create rides.")

        if driver_profile.status != 'approved':
            raise serializers.ValidationError("Admin approval required before driver can create rides.")

        serializer.save(driver=driver_profile)


class RideDetailView(generics.RetrieveAPIView):
    queryset = Ride.objects.all()
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]


class DriverRidesView(generics.ListAPIView):
    serializer_class = RideSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            driver_profile = user.driver_profile
        except DriverProfile.DoesNotExist:
            return Ride.objects.none()
        return Ride.objects.filter(driver=driver_profile).order_by('-created_at')


class SearchRideView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        form = SearchRideForm(data=request.query_params)
        if not form.is_valid():
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

        cd = form.cleaned_data
        p_source_lat = cd['source_lat']
        p_source_lng = cd['source_lng']
        p_dest_lat = cd['dest_lat']
        p_dest_lng = cd['dest_lng']
        search_time = cd['date_time']
        women_only = cd.get('women_only', False)
        ride_type = cd.get('ride_type')
        vehicle_type = cd.get('vehicle_type')

        time_lower = search_time - timedelta(minutes=30)
        time_upper = search_time + timedelta(minutes=30)

        # Rough bounding box first (fast DB filter), then refine with Haversine
        lat_diff = 5.0 / 111.0
        lng_diff = 5.0 / 111.0

        rides = Ride.objects.filter(
            is_active=True,
            available_seats__gt=0,
            departure_time__range=(time_lower, time_upper),
            source_lat__range=(p_source_lat - lat_diff, p_source_lat + lat_diff),
            source_lng__range=(p_source_lng - lng_diff, p_source_lng + lng_diff),
            dest_lat__range=(p_dest_lat - lat_diff, p_dest_lat + lat_diff),
            dest_lng__range=(p_dest_lng - lng_diff, p_dest_lng + lng_diff),
        )

        if women_only:
            rides = rides.filter(women_only=True)
        if ride_type:
            rides = rides.filter(ride_type=ride_type)
        if vehicle_type:
            rides = rides.filter(driver__vehicle_type=vehicle_type)

        # Refine with Haversine distance <= 5 km
        matched_rides = []
        for ride in rides:
            src_dist = calculate_distance(p_source_lat, p_source_lng, ride.source_lat, ride.source_lng)
            dest_dist = calculate_distance(p_dest_lat, p_dest_lng, ride.dest_lat, ride.dest_lng)
            if src_dist <= 5.0 and dest_dist <= 5.0:
                matched_rides.append(ride)

        serializer = RideSerializer(matched_rides, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --------------- Review views ---------------

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        ride = serializer.validated_data['ride']
        serializer.save(reviewer=self.request.user, driver=ride.driver)


class RideReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ride_id = self.kwargs['pk']
        return Review.objects.filter(ride_id=ride_id).order_by('-created_at')
