from django.shortcuts import render


def home(request):
    return render(request, "home.html")


def wrong_note(request):
    return render(request, "wrong_note.html")

    