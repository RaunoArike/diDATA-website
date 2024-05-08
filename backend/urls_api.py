from django.urls import path
from .api import chart_view, assignments_view, courses_view, test_data_view

urlpatterns = [
    path('courses/<int:course_code>/assignments/<int:assignment_id>/', chart_view, name='chart_data'),
    path('courses/<int:course_code>/assignments/', assignments_view, name='assignments'),
    path('courses/', courses_view, name='courses'),
    path('test_data/', test_data_view, name='test')
]