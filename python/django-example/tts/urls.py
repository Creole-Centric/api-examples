from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import webhook_views

router = DefaultRouter()
router.register(r'tts/jobs', views.TTSJobViewSet, basename='tts-job')

urlpatterns = [
    path('', include(router.urls)),
    path('tts/voices/', views.get_voices, name='tts-voices'),
    path('tts/models/', views.get_models, name='tts-models'),
    path('credits/balance/', views.get_credit_balance, name='credit-balance'),

    # Webhook endpoints (RECOMMENDED for production)
    path('webhooks/tts/', webhook_views.webhook_receiver, name='webhook-receiver'),
    path('webhooks/test/', webhook_views.webhook_test, name='webhook-test'),
]
