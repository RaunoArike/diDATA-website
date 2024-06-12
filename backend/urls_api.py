from django.urls import path
from .api import chart_view, assignments_view, courses_view, test_data_view, verification_view

urlpatterns = [
    path('courses/<int:course_code>/assignments/<int:assignment_id>/', chart_view, name='chart_data'),
    path('courses/<int:course_code>/assignments/<int:assignment_id>/update/', chart_view, {'update': True}, name='chart_data_update'),
    path('courses/<int:course_code>/assignments/', assignments_view, name='assignments'),
    path('courses/', courses_view, name='courses'),
    path('test_data/', test_data_view, name='test'),
    path('verify/', verification_view, name='verify')
]