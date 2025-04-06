from django.db import models
from django.contrib.auth.models import User, Group
from django.utils import timezone

class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='restaurants')
    
    def __str__(self):
        return self.name

class MenuItem(models.Model):
    CATEGORY_CHOICES = [
        ('appetizer', 'Appetizer'),
        ('main', 'Main Course'),
        ('dessert', 'Dessert'),
        ('beverage', 'Beverage'),
        ('side', 'Side Dish'),
        ('special', 'Special'),
    ]
    
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='main')
    
    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

class Cart(models.Model):
    customer = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    
    def __str__(self):
        return f"Cart for {self.customer.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"
    
    @property
    def subtotal(self):
        return self.quantity * self.menu_item.price

class Order(models.Model):
    STATUS_CHOICES = [
        ('preparing', 'Preparing'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    delivery_crew = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        related_name='delivery_orders',
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Preparing')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = models.TextField()
    order_date = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Order #{self.id} - {self.customer.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"
    
    @property
    def subtotal(self):
        return self.quantity * self.unit_price
