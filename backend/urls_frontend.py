from django.urls import path
from .views import main_page_view, login_view

urlpatterns = [
    path('', main_page_view, name='index'),
    path('login/', login_view, name='login'),
]