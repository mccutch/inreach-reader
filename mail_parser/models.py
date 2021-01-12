from django.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.
class InReachMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages', null=True)
    sender = models.CharField(max_length=30, default="Unknown")
    date = models.DateTimeField(auto_now_add=True, null=True)
    lat = models.FloatField(default=0)
    lon = models.FloatField(default=0)
    message = models.TextField(default="None")
    mapshare = models.URLField(default="#")
    original = models.TextField(default="None")

    class Meta:
        ordering = ["-date"]
    
    def __str__(self):
        """String for representing the Model object."""
        return f'{self.sender}, {self.date}'
"""
class Point(models.Model):
    lat = models.FloatField()
    lng = models.FloatField()
    label = models.CharField(max_length=3)

    def __str__(self):
        return f'{self.label}'"""


class Trip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    name = models.CharField(max_length=60, default="Unnamed Trip")
    departs = models.DateTimeField()
    returns = models.DateTimeField()
    overdue = models.DateTimeField(null=True)
    description = models.TextField(default="", blank=True)
    instructions = models.TextField(default="", blank=True)
    points = models.TextField(default="[]")
    paths = models.TextField(default="[]")
    uuid = models.UUIDField(default=uuid.uuid4, unique=True)

    class Meta:
        ordering = ["-departs"]

    def __str__(self):
        """String for representing the Model object."""
        return f'{self.name}: {self.departs}'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    location = models.CharField(max_length=60, blank=True)
    loc_lat = models.DecimalField(max_digits=16, decimal_places=10, blank=True, null=True)
    loc_lng = models.DecimalField(max_digits=16, decimal_places=10, blank=True, null=True)
    pass_phrase = models.CharField(max_length=60, blank=True)
    
    def __str__(self):
        """String for representing the Model object."""
        return f'{self.user.get_username()}'