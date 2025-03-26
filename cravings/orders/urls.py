from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views import UserProfileView

urlpatterns = [
    # Restaurant URLs
    path('restaurants/', views.RestaurantList.as_view(), name='restaurant-list'),
    path('restaurants/<int:pk>/', views.RestaurantDetail.as_view(), name='restaurant-detail'),
    
    # Menu Item URLs
    path('restaurants/<int:restaurant_id>/menu-items/', views.MenuItemList.as_view(), name='menuitem-list'),
    path('restaurants/<int:restaurant_id>/menu-items/<int:pk>/', views.MenuItemDetail.as_view(), name='menuitem-detail'),
    
    # Cart URLs
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/items/', views.CartItemList.as_view(), name='cartitem-list'),
    path('cart/items/<int:pk>/', views.CartItemDetail.as_view(), name='cartitem-detail'),
    
    # Order URLs
    path('orders/', views.OrderList.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetail.as_view(), name='order-detail'),
    path('orders/<int:pk>/assign-delivery/', views.AssignDeliveryView.as_view(), name='assign-delivery'),
    path('orders/<int:pk>/mark-delivered/', views.MarkDeliveredView.as_view(), name='mark-delivered'),
    
    
    path('user-role/', views.UserRoleView.as_view(), name='user-role'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
] 