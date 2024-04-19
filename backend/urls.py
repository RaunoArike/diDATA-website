from django.urls import path
from .views import sample_data_view
from .views import index  # Import the view

urlpatterns = [
    path('data/', sample_data_view, name='sample_data'),
    path('', index, name='index'),  # Serve the HTML file at the base URL of your app
]