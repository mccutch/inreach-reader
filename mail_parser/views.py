#from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User

from fastkml import kml

from . import models
from . import serializers
from . import permissions


#GARMIN TEST
import requests


class MapshareAPI(APIView):
    """
    Access the inReach API and return a formatted response of the KML data in json format.

    URL suffix is passed directly to Garmin API endpoint.

    See docs: https://support.garmin.com/en-CA/?faq=tdlDCyo1fJ5UxjUbA9rMY8
    """
    permission_classes=(AllowAny,)

    def parse_features(self, document):
        placemarks = []

        for feature in document:
            if isinstance(feature, kml.Placemark):
                placemarks.append(self.parse_placemark(feature))
            if isinstance(feature, kml.Folder):
                placemarks.extend(self.parse_features(list(feature.features())))
            if isinstance(feature, kml.Document):
                placemarks.extend(self.parse_features(list(feature.features())))
                
        return placemarks

    def parse_placemark(self, placemark):
        p = placemark
        data = {}
        data["name"] = p.name if p.name else None
        data["description"] = p.description if p.description else None
        data["timestamp"] = p.timeStamp if p.timeStamp else None
        
        if p.geometry:
            geom_data = {}
            geom_data["coords"] = p.geometry.coords
            geom_data["type"] = p.geometry.geom_type
            data["geometry"] = geom_data

        if p.extended_data:
            ext_data = {}
            for element in p.extended_data.elements:
                ext_data[element.name]=element.value
            data["extendedData"] = ext_data

        return data



    def get(self, request, mapshareID, filters=None, format=None):
        urlSuffix = mapshareID
        if filters:
            urlSuffix += f'?{filters}'
        response = requests.get('https://share.garmin.com/Feed/Share/'+urlSuffix)

        try:
            # Read KML from response
            k = kml.KML()
            k.from_string(response.content)

            features = list(k.features())
            placemarks = self.parse_features(features)
            content = {
                'is_valid': True,
                'MapshareID': mapshareID,
                'API_status': response.status_code,
                'placemarks': placemarks if placemarks else None,
            }
            return Response(content)

        except:
            errors = {
                'is_valid': False,
                'Error': 'Unable to read KML data.',
                'API_status': response.status_code,
                'Reponse status': response.reason,
                'Content': response.content,
            }
            return Response(errors)
            #return Response(errors, status=status.HTTP_400_BAD_REQUEST)



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
        An endpoint for viewing a user's trip data. This endpoint can be weakly protected by a pass phrase.
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
            all_trips = user.trips.all()
            tripData = serializers.TripSerializer(all_trips, many=True, context={'request':request}).data
        except:
            tripData = {}

        content = {
            "user":userData,
            "trips":tripData,
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
            #contacts
        }

        return Response(content)


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






