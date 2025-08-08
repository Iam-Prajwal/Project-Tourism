from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q, Count
from .models import Category, Product, CartItem, Order, OrderItem

def category_list_view(request):
    """Display all categories with product counts"""
    categories = Category.objects.annotate(product_count=Count('products'))
    all_products_count = Product.objects.count()
    return render(request, 'categories.html', {
        'categories': categories,
        'all_products_count': all_products_count
    })

def product_list_view(request):
    """Display all products with filtering and sorting"""
    queryset = Product.objects.select_related('category')
    
    # Search filter
    search = request.GET.get('search', '')
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )
    
    # Category filter
    category = request.GET.get('category', '')
    if category and category != 'all':
        queryset = queryset.filter(category__slug=category)
    
    # Price range filter
    price_range = request.GET.get('price_range', '')
    if price_range and price_range != 'all':
        if price_range == '0-300':
            queryset = queryset.filter(price__lte=300)
        elif price_range == '300-500':
            queryset = queryset.filter(price__gte=300, price__lte=500)
        elif price_range == '500-700':
            queryset = queryset.filter(price__gte=500, price__lte=700)
        elif price_range == '700+':
            queryset = queryset.filter(price__gte=700)
    
    # Bestseller filter
    bestsellers_only = request.GET.get('bestsellers_only', 'false').lower() == 'true'
    if bestsellers_only:
        queryset = queryset.filter(bestseller=True)
    
    # In stock filter
    in_stock_only = request.GET.get('in_stock_only', 'false').lower() == 'true'
    if in_stock_only:
        queryset = queryset.filter(in_stock__gt=0)
    
    # Sorting
    sort_by = request.GET.get('sort', 'featured')
    if sort_by == 'price-low':
        queryset = queryset.order_by('price')
    elif sort_by == 'price-high':
        queryset = queryset.order_by('-price')
    elif sort_by == 'rating':
        queryset = queryset.order_by('-rating')
    elif sort_by == 'popularity':
        queryset = queryset.order_by('-reviews')
    else:  # featured
        queryset = queryset.order_by('-bestseller', '-rating', '-created_at')
    
    return render(request, 'souvenirs/souvenirs.html', {'products': queryset})

def cart_view(request):
    """Display all cart items for the current session"""
    session_key = request.session.session_key
    cart_items = CartItem.objects.filter(session_key=session_key).select_related('product')
    
    total_items = sum(item.quantity for item in cart_items)
    total_price = sum(item.total_price for item in cart_items)
    
    return render(request, 'cart.html', {
        'cart_items': cart_items,
        'total_items': total_items,
        'total_price': total_price
    })

def add_to_cart(request, product_id):
    """Add item to cart or update quantity if exists"""
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
    
    product = get_object_or_404(Product, id=product_id)
    quantity = int(request.POST.get('quantity', 1))
    
    if quantity > product.in_stock:
        return render(request, 'error.html', {
            'error': f'Only {product.in_stock} items available in stock'
        })
    
    cart_item, created = CartItem.objects.get_or_create(
        session_key=session_key,
        product=product,
        defaults={'quantity': quantity}
    )
    
    if not created:
        new_quantity = cart_item.quantity + quantity
        if new_quantity > product.in_stock:
            return render(request, 'error.html', {
                'error': f'Cannot add more items. Only {product.in_stock} available, you already have {cart_item.quantity} in cart'
            })
        cart_item.quantity = new_quantity
        cart_item.save()
    
    return redirect('cart_view')

def update_cart_item(request, item_id):
    """Update cart item quantity"""
    session_key = request.session.session_key
    cart_item = get_object_or_404(CartItem, id=item_id, session_key=session_key)
    
    quantity = int(request.POST.get('quantity', cart_item.quantity))
    if quantity > cart_item.product.in_stock:
        return render(request, 'error.html', {
            'error': f'Only {cart_item.product.in_stock} items available in stock'
        })
    
    cart_item.quantity = quantity
    cart_item.save()
    return redirect('cart_view')

def remove_from_cart(request, item_id):
    """Remove item from cart"""
    session_key = request.session.session_key
    if not session_key:
        return redirect('product_list_view') # Or render an error page
    cart_item = get_object_or_404(CartItem, id=item_id, session_key=session_key)
    cart_item.delete()
    return redirect('cart_view')

def clear_cart(request):
    """Clear entire cart"""
    session_key = request.session.session_key
    if not session_key:
        return redirect('product_list_view') # Or render an error page
    CartItem.objects.filter(session_key=session_key).delete()
    return redirect('cart_view')

def create_order(request):
    """Create order from cart items"""
    session_key = request.session.session_key
    if not session_key:
        return redirect('product_list_view') # Or render an error page

    cart_items = CartItem.objects.filter(session_key=session_key)

    if not cart_items.exists():
        return render(request, 'error.html', {'error': 'Cart is empty.'})

    total_amount = sum(item.total_price for item in cart_items)

    order = Order.objects.create(
        session_key=session_key,
        total_amount=total_amount
    )

    for cart_item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=cart_item.product,
            quantity=cart_item.quantity,
            price=cart_item.product.price # Use the price at the time of order
        )
        cart_item.product.in_stock -= cart_item.quantity
        cart_item.product.save()

    cart_items.delete() # Clear cart after creating order

    return redirect('get_order', order_id=order.id) # Redirect to the order detail page

def get_order(request, order_id):
    """Get order details"""
    session_key = request.session.session_key
    if not session_key:
        return redirect('product_list_view') # Or render an error page

    order = get_object_or_404(Order.objects.select_related(), id=order_id, session_key=session_key)
    order_items = order.items.all().select_related('product')

    return render(request, 'order_detail.html', {
        'order': order,
        'order_items': order_items
    })