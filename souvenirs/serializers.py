from rest_framework import serializers
from .models import Category, Product, CartItem, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    discount_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'original_price',
            'category', 'category_name', 'image', 'rating', 'reviews',
            'bestseller', 'in_stock', 'discount_percentage', 'created_at'
        ]


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.URLField(source='product.image', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_original_price = serializers.DecimalField(source='product.original_price', max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.ReadOnlyField()
    total_savings = serializers.ReadOnlyField()
    in_stock = serializers.IntegerField(source='product.in_stock', read_only=True)
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'product_name', 'product_image', 'product_price',
            'product_original_price', 'quantity', 'total_price', 'total_savings',
            'in_stock', 'created_at'
        ]
        read_only_fields = ['session_key']
    
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        
        # Check if we're updating an existing cart item
        if self.instance:
            product = self.instance.product
        else:
            # For new cart items, get product from validated_data
            product_id = self.initial_data.get('product')
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError("Product does not exist.")
        
        if value > product.in_stock:
            raise serializers.ValidationError(f"Only {product.in_stock} items available in stock.")
        
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.URLField(source='product.image', read_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_image',
            'quantity', 'price', 'total_price'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'total_amount', 'status', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['session_key']


class CreateOrderSerializer(serializers.Serializer):
    """Serializer for creating orders from cart items"""
    
    def create(self, validated_data):
        session_key = self.context['session_key']
        
        # Get all cart items for this session
        cart_items = CartItem.objects.filter(session_key=session_key)
        
        if not cart_items.exists():
            raise serializers.ValidationError("Cart is empty.")
        
        # Calculate total amount
        total_amount = sum(item.total_price for item in cart_items)
        
        # Create order
        order = Order.objects.create(
            session_key=session_key,
            total_amount=total_amount
        )
        
        # Create order items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )
            
            # Update stock
            product = cart_item.product
            product.in_stock -= cart_item.quantity
            product.save()
        
        # Clear cart
        cart_items.delete()
        
        return order