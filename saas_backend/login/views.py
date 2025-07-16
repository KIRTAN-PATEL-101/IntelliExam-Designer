from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib import messages
from .forms import LoginForm, SignUpForm


def login_view(request):
    """Handle user login with email and password"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, username=email, password=password)
            if user is not None:
                auth_login(request, user)
                messages.success(request, 'Successfully logged in!')
                return redirect('home')
            else:
                messages.error(request, 'Invalid email or password.')
    else:
        form = LoginForm()
    
    return render(request, 'login/login.html', {'form': form})


def logout_view(request):
    """Handle user logout"""
    auth_logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')


def signup_view(request):
    """Handle user registration"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Log the user in after successful registration
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=email, password=password)
            if user is not None:
                auth_login(request, user)
                messages.success(request, 'Account created successfully!')
                return redirect('home')
    else:
        form = SignUpForm()
    
    return render(request, 'login/signup.html', {'form': form})
