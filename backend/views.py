from django.shortcuts import render

def main_page_view(request):
    return render(request, 'index.html')

def login_view(request):
    return render(request, 'login.html')
