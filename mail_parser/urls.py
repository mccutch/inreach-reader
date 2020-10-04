# carbontax/urls.py

from django.urls import path, include
from . import views
from rest_framework_simplejwt import views as jwt_views
#from rest_framework.urlpatterns import format_suffix_patterns
#from django.contrib.auth import views as auth_views
from django.views.generic.base import TemplateView #Serve sw.js
from . import serializers




urlpatterns = [
    # STATIC ASSETS
    #path('', views.index, name='index'),
    path('', TemplateView.as_view(template_name="index.html"), name='index'),   

    path('api-auth/', include('rest_framework.urls')),
    path('token/', jwt_views.TokenObtainPairView.as_view(serializer_class=serializers.FlexibleJWTSerializer), name='token_obtain_pair'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),

    path('api/inreach-messages/', views.PostNewMessage.as_view(), name="inreach-messages"),

    path('api/user/<int:pk>/', views.UserDetail.as_view(), name="user-detail"),
    path('api/profile/<int:pk>/', views.ProfileDetail.as_view(), name="profile-detail"),

    path('api/my-messages/', views.UserMessages.as_view(), name="my-messages"),

    path('api/current-user/', views.CurrentUser.as_view(), name="current-user"),
    path('api/my-profile/', views.UserProfile.as_view(), name="my-profile"),
    path('api/login/', views.Login.as_view(), name="login"),

    path('account/register/', views.UserCreate.as_view(), name="create-user"),
    path('account/update-password/', views.UpdatePassword.as_view(), name="update-password"),
    path('account/', include('django.contrib.auth.urls')), # django default password reset views  
    path('registration/check-username/', views.ValidateUsername.as_view(), name="check-username"),
    path('registration/check-email/', views.ValidateEmail.as_view(), name="check-email"),
    path('registration/check-unique/', views.CheckUnique.as_view(), name="check-unique"),
]

