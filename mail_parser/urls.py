# carbontax/urls.py

from django.urls import path, include
from . import views
from . import validation_views as validations
from rest_framework_simplejwt import views as jwt_views
#from rest_framework.urlpatterns import format_suffix_patterns
#from django.contrib.auth import views as auth_views
from django.views.generic.base import TemplateView #Serve sw.js
from . import serializers




urlpatterns = [
    path('', TemplateView.as_view(template_name="index.html"), name='index'),


    path('api/view-user/<slug:username>/', views.ViewUser.as_view(), name='view-user'),
    path('api/view-trip/<slug:uuid>/', views.TripReadOnly.as_view(), name='view-trip'),

    path('api-auth/', include('rest_framework.urls')),
    path('token/', jwt_views.TokenObtainPairView.as_view(serializer_class=serializers.FlexibleJWTSerializer), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    path('api/inreach-messages/', views.PostNewMessage.as_view(), name="inreach-messages"),

    path('api/user/<int:pk>/', views.UserDetail.as_view(), name="user-detail"),
    path('api/profile/<int:pk>/', views.ProfileDetail.as_view(), name="profile-detail"),
    path('api/message/<int:pk>/', views.MessageDetail.as_view(), name="message-detail"),
    path('api/trip/<int:pk>/', views.TripDetail.as_view(), name="trip-detail"),
    path('api/contact/<int:pk>/', views.ContactDetail.as_view(), name="contact-detail"),
    #path('api//<int:pk>/', views.Detail.as_view(), name="-detail"),



    path('api/my-messages/', views.UserMessages.as_view(), name="my-messages"),
    path('api/my-trips/', views.UserTrips.as_view(), name="my-trips"),
    path('api/my-contacts/', views.UserContacts.as_view(), name="my-contacts"),

    path('api/current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('api/my-profile/', views.UserProfile.as_view(), name="my-profile"),
    path('api/login/', views.Login.as_view(), name="login"),

    path('account/register/', views.UserCreate.as_view(), name="create-user"),

    path('account/update-password/', validations.UpdatePassword.as_view(), name="update-password"),
    path('account/', include('django.contrib.auth.urls')), # django default password reset views  
    path('registration/check-username/', validations.ValidateUsername.as_view(), name="check-username"),
    path('registration/check-email/', validations.ValidateEmail.as_view(), name="check-email"),
    path('registration/check-unique/', validations.CheckUnique.as_view(), name="check-unique"),
]

