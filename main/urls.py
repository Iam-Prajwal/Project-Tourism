from django.urls import path
from django.conf import settings
from .views import *
from django.conf.urls.static import static


from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', index, name="index"),  
    path('community/', community, name="community"),
    path('contribution/', contribution, name="contribution"),
     
  
    # authentication urls starts here
    path("login/", log_in, name='log_in'),
    path("register/", register, name='register'),
    path("logout/", log_out, name='log_out'),
    path("change_password/", change_password, name='change_password'),
    path('user_profile/',user_profile, name='user_profile'),
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name="auth/password_reset.html"), name='password_reset'),
    path('password_reset_done/', auth_views.PasswordResetDoneView.as_view(template_name="auth/password_reset_done.html"), name='password_reset_done'),
    path('password_reset_confirm/<uidb64>/<token>/',auth_views.PasswordResetConfirmView.as_view(template_name="auth/password_reset_confirm.html"), name='password_reset_confirm'),
    path('password_reset_complete/', auth_views.PasswordResetCompleteView.as_view(template_name="auth/password_reset_complete.html"), name='password_reset_complete'),
    #authentication work ends here

    # food urls starts here
    path('listoffood/',listoffood,name='listoffood'),
    path('historical_significance/<int:id>',historical_significance,name='historical_significance'),
    path('recipe/<int:id>',recipe,name='recipe'),
    path('ingredient_shop/<int:id>',ingredient_shop,name='ingredient_shop'),
    path('tutorial/<int:id>',tutorial,name='tutorial'),
    path('online_buying/<int:id>',online_buying,name='online_buying'),
    path('restaurant/<int:id>',restaurant,name='restaurant'),
    # food urls ends here

    # sites starts starts here
    path('sites/',listofsites,name='sites'),
    path('site_detail/<int:id>',site_detail,name='site_detail'),
    # sites ends here

    # tourism services starts here
    path('tourism_services/',tourism_services,name='tourism_services'),
    # tourism services ends here

    # weather starts here
     path('weather/', weather_view, name='weather'),
     path('api/weather/', weather_api, name='weather_api'),
     #weather ends here

     # events starts here
     path('events/', events_view, name='events'),  # Use 'events' as the name
     path('events/<int:event_id>/learnmore/', learnmore_view, name='learnmore'),
    # events ends here
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

