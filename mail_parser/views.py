#from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from . import models
from . import serializers

# Create your views here.
class InReachMessages(generics.ListCreateAPIView):
    #queryset = models.EmissionInstance.objects.all()
    permission_classes = (AllowAny, )
    serializer_class = serializers.InReachMessageSerializer
    queryset = models.InReachMessage.objects.all()
