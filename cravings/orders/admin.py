from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, Cart, CartItem, Order, OrderItem

class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'opening_time', 'closing_time')
    search_fields = ('name', 'owner__username')

class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'price', 'is_available', 'category')
    list_filter = ('restaurant', 'is_available', 'category')
    search_fields = ('name', 'restaurant__name')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'restaurant', 'delivery_crew', 'status', 'total', 'order_date')
    list_filter = ('status', 'restaurant', 'order_date')
    search_fields = ('customer__username', 'restaurant__name', 'delivery_crew__username')
    inlines = [OrderItemInline]

# Register models
admin.site.register(Restaurant, RestaurantAdmin)
admin.site.register(MenuItem, MenuItemAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
