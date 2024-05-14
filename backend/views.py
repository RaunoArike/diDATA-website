from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def assignments_view(request, course_code):
    return render(request, 'assignments.html', {'course_code': course_code})

def courses_view(request):
    return render(request, 'courses.html')

def chart_view(request, course_code, assignment_id):
    return render(request, 'chart.html', {'course_code': course_code, 'assignment_id': assignment_id})