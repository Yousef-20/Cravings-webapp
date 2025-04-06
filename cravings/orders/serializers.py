from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Restaurant, MenuItem, Cart, CartItem, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RestaurantSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.username')
    
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'description', 'opening_time', 'closing_time', 'owner', 'owner_name']
        read_only_fields = ['owner']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

class MenuItemSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.ReadOnlyField(source='restaurant.name')
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuItem
        fields = ['id', 'restaurant', 'restaurant_name', 'name', 'description', 
                 'price', 'image', 'image_url', 'is_available', 'category']
        read_only_fields = ['restaurant']
    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

class CartItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name')
    price = serializers.ReadOnlyField(source='menu_item.price')
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'price', 'subtotal']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'customer', 'items', 'total']
        read_only_fields = ['customer']
    
    def get_total(self, obj):
        return sum(item.subtotal for item in obj.items.all())

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name')
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'unit_price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.ReadOnlyField(source='customer.username')
    restaurant_name = serializers.ReadOnlyField(source='restaurant.name')
    delivery_crew_name = serializers.ReadOnlyField(source='delivery_crew.username')
    order_date = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ')
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'restaurant_name',
            'delivery_crew_name', 'status', 'total',
            'delivery_address', 'items', 'order_date'
        ]
        read_only_fields = ['customer', 'restaurant', 'total', 'status', 'order_date'] 