from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("tutorial/", views.tutorial, name="tutorial"),
    path("practice/free/", views.practice_free, name="practice_free"),
    path("wrong-note/", views.wrong_note, name="wrong_note"),
    
]
