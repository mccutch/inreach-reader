from . import models
from rest_framework import serializers
#from django.contrib.auth.models import User
#from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class InReachMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InReachMessage
        fields = ['sender', 'date', 'lat', 'lon']