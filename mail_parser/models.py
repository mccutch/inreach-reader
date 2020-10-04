from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class InReachMessage(models.Model):
    sender = models.CharField(max_length=30, default="Unknown")
    date = models.DateTimeField(auto_now_add=True, null=True)
    lat = models.FloatField(default=0)
    lon = models.FloatField(default=0)
    message = models.TextField(default="None")
    
    def __str__(self):
        """String for representing the Model object."""
        return f'{self.sender}, {self.date}'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    location = models.CharField(max_length=60, blank=True)
    loc_lat = models.DecimalField(max_digits=16, decimal_places=10, blank=True, null=True)
    loc_lng = models.DecimalField(max_digits=16, decimal_places=10, blank=True, null=True)
    
    def __str__(self):
        """String for representing the Model object."""
        return f'{self.user.get_username()}'