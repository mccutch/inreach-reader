#from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User

from . import models
from . import serializers
from . import permissions

# Create your views here.
class Login(APIView):
    permission_classes=(IsAuthenticated,)

    def get(self, request, format=None):
        user=request.user
        try:
            profileData = serializers.ProfileSerializer(user.profile, context={'request':request}).data
        except:
            profileData = {}

        try:
            all_messages = user.messages.all()
            messageData = serializers.InReachMessageSerializer(all_messages, many=True, context={'request':request}).data
        except:
            messageData = {}

        try:
            all_trips = user.trips.all()
            tripData = serializers.TripSerializer(all_trips, many=True, context={'request':request}).data
        except:
            tripData = {}

        contactData = serializers.ContactSerializer(user.contacts.all(), many=True, context={'request':request}).data


        content = {
            "user":serializers.UserSerializer(user, context={'request':request}).data,
            "profile":profileData,
            "messages":messageData,
            "trips":tripData,
            "contacts":contactData,
        }
        return Response(content)

class ViewUser(APIView):
    """
        An endpoint for viewing a user's trip and message data. This endpoint can be weakly protected by a pass phrase.
        GET: Return a status indicating whether or not the user exists.
        POST: If the user uses a pass_phrase, this must be included in the POST request. Grants access to user's trips and messages.
    """
    permission_classes=(AllowAny,)

    def get(self, request, username, format=None):
        try:
            user = User.objects.get(username=username)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def post(self, request, username, format=None):

        try:
            user = User.objects.get(username=username)
            userData = serializers.UserSerializer(user, context={'request':request}).data,
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Check pass phrase (if it exists in user profile)
        if user.profile.pass_phrase:
            serializer = serializers.PassPhraseSerializer(data=request.data, context={'request':request})
            if serializer.is_valid():

                if serializer.data['pass_phrase']!=user.profile.pass_phrase:
                    print(f"Pass phrase doesn't match: {user.profile.pass_phrase}")
                    return Response({'Unauthorised':'Contact owner for correct pass phrase'}, status=status.HTTP_403_FORBIDDEN)
                else :
                    print("Pass phrase correct, permission granted.")
            else:
                # Resubmit with pass phrase
                return Response(serializer.errors, status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            print("No pass phrase has been set. Permission granted.")

        try:
            all_messages = user.messages.all()
            messageData = serializers.InReachMessageSerializer(all_messages, many=True, context={'request':request}).data
        except:
            messageData = {}

        try:
            all_trips = user.trips.all()
            tripData = serializers.TripSerializer(all_trips, many=True, context={'request':request}).data
        except:
            tripData = {}

        content = {
            "user":userData,
            "trips":tripData,
            "messages":messageData,
        }

        return Response(content)

class TripReadOnly(APIView):
    permission_classes = (AllowAny,)
    
    def get(self, request, uuid, format=None):
        try:
            trip = models.Trip.objects.get(uuid=uuid)
            user = trip.user            
            tripData = serializers.TripSerializer(trip, context={'request':request}).data
            userData = serializers.UserSerializer(user, context={'request':request}).data

        except:
            return Response(status=status.HTTP_404_NOT_FOUND)

        content = {
            "user":userData,
            "trip":tripData,
            #"messages":messageData, ### Later include any messages received within timeframe
        }

        return Response(content)

class PostNewMessage(generics.CreateAPIView):
    permission_classes = (AllowAny, )
    serializer_class = serializers.InReachMessageParser




class UserTrips(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None):
        trips = request.user.trips.all()
        serializer = serializers.TripSerializer(trips, many=True, context={'request':request})
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['user']=f'{request.user.id}'
        print(data)
        serializer = serializers.TripSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserContacts(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None):
        contacts = request.user.contacts.all()
        serializer = serializers.ContactSerializer(contacts, many=True, context={'request':request})
        return Response(serializer.data)

    def post(self, request, format=None):
        data=request.data
        data['user']=f'{request.user.id}'
        serializer = serializers.ContactSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserMessages(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.InReachMessageSerializer

    def get_queryset(self):
        user = self.request.user
        return user.messages.all()

class UserProfile(APIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    
    def get(self, request, format=None):
        try:
            profile = request.user.profile
            serializer = serializers.ProfileSerializer(profile, context={'request':request})
            return Response(serializer.data)
        except:
            content = {
                "profile":"Not found"
            }
            return Response(content)

    def post(self, request, format=None):
        data=request.data
        data['user']=request.user.id
        print(data)
        serializer = serializers.ProfileSerializer(data=data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUser(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        return Response(serializers.UserSerializer(self.request.user, context={'request':request}).data)






class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.UserSerializer
    queryset = User.objects.all()

class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.ProfileSerializer
    queryset = models.Profile.objects.all() 

class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.InReachMessageSerializer
    queryset = models.InReachMessage.objects.all() 

class TripDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.TripSerializer
    queryset = models.Trip.objects.all() 

class ContactDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, permissions.IsOwner)
    serializer_class = serializers.ContactSerializer
    queryset = models.Contact.objects.all() 


class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.CreateUserSerializer
    permission_classes = (AllowAny, )






