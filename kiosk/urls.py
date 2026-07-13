from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("wrong-note/", views.wrong_note, name="wrong_note"),
    
]