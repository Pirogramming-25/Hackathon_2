from django.shortcuts import render


def home(request):
    return render(request, "home.html")


def tutorial(request):
    return render(request, "tutorial.html")


def wrong_note(request):
    return render(request, "wrong_note.html")

    