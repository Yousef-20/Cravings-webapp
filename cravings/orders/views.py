from django.shortcuts import render
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User, Group
from django.shortcuts import get_object_or_404
from .models import Restaurant, MenuItem, Cart, CartItem, Order, OrderItem
from .serializers import (
    UserSerializer, RestaurantSerializer, MenuItemSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer
)
from .permissions import IsRestaurantOwner, IsDeliveryCrew, IsCustomer
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError


# Restaurant Views
class RestaurantList(generics.ListCreateAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Restaurant.objects.all()
        elif user.groups.filter(name='Restaurant Owner').exists():
            return Restaurant.objects.filter(owner=user)
        return Restaurant.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class RestaurantDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Restaurant.objects.all()
        return Restaurant.objects.filter(owner=self.request.user)

# Menu Item Views
class MenuItemList(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        if self.request.user.is_staff:
            return MenuItem.objects.filter(restaurant_id=restaurant_id)
        elif self.request.user.groups.filter(name='Restaurant Owner').exists():
            return MenuItem.objects.filter(
                restaurant_id=restaurant_id,
                restaurant__owner=self.request.user
            )
        return MenuItem.objects.filter(
            restaurant_id=restaurant_id,
            is_available=True
        )
    
    def perform_create(self, serializer):
        restaurant = get_object_or_404(
            Restaurant, 
            id=self.kwargs['restaurant_id'],
            owner=self.request.user
        )
        if restaurant.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionError("You don't have permission to add items to this restaurant")
        serializer.save(restaurant=restaurant)

class MenuItemDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated, IsRestaurantOwner]
    
    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return MenuItem.objects.filter(restaurant_id=restaurant_id)

# Cart Views
class CartView(generics.RetrieveUpdateAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(customer=self.request.user)
        return cart

class CartItemList(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_queryset(self):
        cart, created = Cart.objects.get_or_create(customer=self.request.user)
        return CartItem.objects.filter(cart=cart)
    
    def perform_create(self, serializer):
        cart, created = Cart.objects.get_or_create(customer=self.request.user)
        menu_item = MenuItem.objects.get(id=self.request.data['menu_item'])
        
        # Check if cart has items from a different restaurant
        existing_items = CartItem.objects.filter(cart=cart)
        if existing_items.exists():
            existing_restaurant = existing_items.first().menu_item.restaurant
            if menu_item.restaurant != existing_restaurant:
                raise ValidationError(
                    "You can only add items from one restaurant at a time. "
                    "Please empty your cart first to order from a different restaurant."
                )
        
        serializer.save(cart=cart)

class CartItemDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated, IsCustomer]
    
    def get_queryset(self):
        # Get cart items that belong to the user's cart
        return CartItem.objects.filter(cart__customer=self.request.user)

    def check_object_permissions(self, request, obj):
        # Check if the cart item belongs to the user's cart
        if obj.cart.customer != request.user:
            self.permission_denied(request)
        return super().check_object_permissions(request, obj)

# Order Views
class OrderList(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        elif user.groups.filter(name='Restaurant Owner').exists():
            return Order.objects.filter(restaurant__owner=user)
        elif user.groups.filter(name='Delivery Crew').exists():
            return Order.objects.filter(delivery_crew=user)
        return Order.objects.filter(customer=user)
    
    def perform_create(self, serializer):
        # Get the user's cart
        cart = Cart.objects.get(customer=self.request.user)
        cart_items = CartItem.objects.filter(cart=cart)
        
        if not cart_items.exists():
            raise ValidationError("Your cart is empty. Add items before placing an order.")
        
        # Get the restaurant from the first cart item
        restaurant = cart_items.first().menu_item.restaurant
        
        # Calculate total
        total = sum(item.quantity * item.menu_item.price for item in cart_items)
        
        # Create the order
        order = serializer.save(
            customer=self.request.user,
            restaurant=restaurant,
            total=total,
            status='pending'
        )
        
        # Create order items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                menu_item=cart_item.menu_item,
                quantity=cart_item.quantity,
                unit_price=cart_item.menu_item.price
            )
        
        # Clear the cart
        cart_items.delete()

class OrderDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        elif user.groups.filter(name='Restaurant Owner').exists():
            return Order.objects.filter(restaurant__owner=user)
        elif user.groups.filter(name='Delivery Crew').exists():
            return Order.objects.filter(delivery_crew=user)
        return Order.objects.filter(customer=user)

class AssignDeliveryView(APIView):
    permission_classes = [IsAuthenticated, IsRestaurantOwner]
    
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        delivery_crew_id = request.data.get('delivery_crew')
        
        if not delivery_crew_id:
            return Response(
                {"detail": "Delivery crew ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            delivery_crew = User.objects.get(
                id=delivery_crew_id,
                groups__name='Delivery Crew'
            )
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid delivery crew ID"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        order.delivery_crew = delivery_crew
        order.status = 'out_for_delivery'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)

class MarkDeliveredView(APIView):
    permission_classes = [IsAuthenticated, IsDeliveryCrew]
    
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        if order.delivery_crew != request.user:
            return Response(
                {"detail": "You can only update orders assigned to you"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        order.status = 'delivered'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)

class UserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.groups.filter(name='Restaurant Owner').exists():
            return Response({'role': 'Restaurant Owner'})
        elif user.groups.filter(name='Delivery Crew').exists():
            return Response({'role': 'Delivery Crew'})
        return Response({'role': 'Customer'})
