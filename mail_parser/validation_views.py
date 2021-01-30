#from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from . import serializers


class ValidateUsername(APIView):
    permission_classes = (AllowAny, )

    def post(self, request):
        print(request.data['username'])

        if User.objects.filter(username=request.data['username']).exists():
            result="false"
        else:
            result="true"
        content = {"unique":result}
        return Response(content)

class ValidateEmail(APIView):
    permission_classes = (AllowAny, )

    def post(self, request):
        print(request.data['email'])

        if User.objects.filter(email=request.data['email']).exists():
            result="false"
        else:
            result="true"
        content = {"unique":result}
        return Response(content)

class CheckUnique(APIView):
    permission_classes = (AllowAny, )

    def post(self, request):
        print(request.data)
        content = {
            'uniqueEmail': not User.objects.filter(email=request.data['email']).exists(),
            'uniqueUsername': not User.objects.filter(username=request.data['username']).exists()
        }
        return Response(content)


class UpdatePassword(APIView):
    """
    An endpoint for changing password.
    """
    permission_classes = (IsAuthenticated, )

    """def get_object(self, queryset=None):
                    return self.request.user"""

    def put(self, request, *args, **kwargs):
        #self.object = self.get_object()
        user = request.user

        serializer = serializers.ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            old_password = serializer.data.get("old_password")
            #if not self.object.check_password(old_password):
            if not user.check_password(old_password):
                return Response({"old_password": ["Wrong password."]}, 
                                status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            #self.object.set_password(serializer.data.get("new_password"))
            #self.object.save()
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
