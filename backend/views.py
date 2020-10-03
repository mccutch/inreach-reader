from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache

example = never_cache(TemplateView.as_view(template_name='gmailApiExample.html'))