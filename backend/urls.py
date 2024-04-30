from django.urls import path
from .views import sample_data_view, index, assignments_view

urlpatterns = [
    path('data/', sample_data_view, name='sample_data'),
    path('assignments/', assignments_view, name='assignments'),
    path('', index, name='index'),  # Serve the HTML file at the base URL of your app
]