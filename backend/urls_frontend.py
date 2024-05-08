from django.urls import path
from .views import index, assignments_view, courses_view, chart_view

urlpatterns = [
    path('', index, name='index'),
    path('courses/', courses_view, name='courses'),
    path('courses/<int:course_code>/assignments/', assignments_view, name='assignments'),
    path('courses/<int:course_code>/assignments/<int:assignment_id>/', chart_view, name='chart')
]