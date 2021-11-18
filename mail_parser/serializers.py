from . import models
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class TripSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    contacts = serializers.PrimaryKeyRelatedField(queryset=models.Contact.objects.all(), many=True)
    class Meta:
        model = models.Trip
        fields = ['user','name','departs','returns','overdue','description','instructions','points','paths','id','uuid','contacts']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'id']

#Does this need to be a hyperlinked serializer?
class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model = models.Profile
        fields = ['user', 'location', 'loc_lat', 'loc_lng', 'pass_phrase', 'mapshare_ID', 'id']
        #read_only_fields = ['pass_phrase']

class ContactSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model = models.Contact
        fields = ['user', 'first_name', 'last_name', 'email', 'mobile', 'relationship', 'notes', 'id']

class CreateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'id')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data['email']
        print(email)

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    def validate_new_password(self, value):
        validate_password(value)
        return value

class FlexibleJWTSerializer(TokenObtainPairSerializer):
    # Credit lardorm: https://stackoverflow.com/questions/34332074/django-rest-jwt-login-using-username-or-email
    # Accepts either username or email address
    def validate(self, attrs):
        credentials = {
            'username': '',
            'password': attrs.get("password")
        }
        user_obj = User.objects.filter(email=attrs.get("username")).first() or User.objects.filter(username=attrs.get("username")).first()
        if user_obj:
            credentials['username'] = user_obj.username
        return super().validate(credentials)

class PassPhraseSerializer(serializers.Serializer):
    pass_phrase = serializers.CharField(required=True)

