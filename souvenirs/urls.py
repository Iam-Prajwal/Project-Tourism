from django.urls import path
from . import views

app_name = 'souvenirs'

urlpatterns = [
    path('', views.product_list_view, name='souvenir_list'),

    # Cart
    path('cart/', views.cart_view, name='cart-list'),
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/<int:item_id>/', views.update_cart_item, name='update-cart-item'),
    path('cart/<int:item_id>/remove/', views.remove_from_cart, name='remove-from-cart'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),
    # Orders
    path('orders/', views.create_order, name='create-order'),
    path('orders/<int:order_id>/', views.get_order, name='get-order'),
]