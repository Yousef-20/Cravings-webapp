from rest_framework import permissions

class IsRestaurantOwner(permissions.BasePermission):
    """
    Custom permission to only allow restaurant owners to access their restaurants.
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Restaurant Owner').exists()
    
    def has_object_permission(self, request, view, obj):
        # For Restaurant model
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        # For MenuItem model
        if hasattr(obj, 'restaurant'):
            return obj.restaurant.owner == request.user
        return False

class IsDeliveryCrew(permissions.BasePermission):
    """
    Custom permission to only allow delivery crew members to access their assigned orders.
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Delivery Crew').exists()
    
    def has_object_permission(self, request, view, obj):
        # Check if the user is assigned to this order
        return obj.delivery_crew == request.user

class IsCustomer(permissions.BasePermission):
    """
    Custom permission to only allow customers to access their own orders.
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Customer').exists() or request.user.is_staff
    
    def has_object_permission(self, request, view, obj):
        # For Cart model
        if hasattr(obj, 'customer'):
            return obj.customer == request.user
        # For CartItem model
        if hasattr(obj, 'cart'):
            return obj.cart.customer == request.user
        return False 