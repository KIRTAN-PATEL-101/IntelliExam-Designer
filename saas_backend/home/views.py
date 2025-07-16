from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def home_view(request):
    """Dashboard view - only accessible to logged-in users"""
    context = {
        'user': request.user,
        'email': request.user.email,
    }
    return render(request, 'home/dashboard.html', context)
