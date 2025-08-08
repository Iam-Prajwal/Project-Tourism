from django.core.management.base import BaseCommand
from products.models import Category, Product


class Command(BaseCommand):
    help = 'Populate database with sample Nepali souvenir data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data population...'))

        # Create categories
        categories_data = [
            {'name': 'Artwork', 'slug': 'artwork'},
            {'name': 'Handicrafts', 'slug': 'handicrafts'},
            {'name': 'Textiles', 'slug': 'textiles'},
            {'name': 'Pottery', 'slug': 'pottery'},
            {'name': 'Jewelry', 'slug': 'jewelry'},
        ]

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name']}
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create products
        products_data = [
            {
                'name': 'Traditional Thangka Painting',
                'description': 'Hand-painted traditional Buddhist Thangka with intricate details',
                'price': 850,
                'original_price': 1200,
                'category_slug': 'artwork',
                'image': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
                'rating': 4.8,
                'reviews': 23,
                'bestseller': True,
                'in_stock': 15
            },
            {
                'name': 'Wooden Pagoda Model',
                'description': "Miniature replica of Bhaktapur's famous Nyatapola Temple",
                'price': 450,
                'original_price': 600,
                'category_slug': 'handicrafts',
                'image': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=400&fit=crop',
                'rating': 4.6,
                'reviews': 18,
                'bestseller': True,
                'in_stock': 8
            },
            {
                'name': 'Nepali Pashmina Shawl',
                'description': 'Premium cashmere pashmina with traditional patterns',
                'price': 320,
                'original_price': 450,
                'category_slug': 'textiles',
                'image': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
                'rating': 4.9,
                'reviews': 34,
                'bestseller': False,
                'in_stock': 25
            },
            {
                'name': 'Ceramic Pottery Set',
                'description': 'Hand-crafted ceramic bowls with traditional Newari designs',
                'price': 280,
                'original_price': 380,
                'category_slug': 'pottery',
                'image': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
                'rating': 4.7,
                'reviews': 12,
                'bestseller': False,
                'in_stock': 20
            },
            {
                'name': 'Silver Temple Jewelry',
                'description': 'Traditional Nepali silver jewelry with precious stones',
                'price': 650,
                'original_price': 850,
                'category_slug': 'jewelry',
                'image': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
                'rating': 4.8,
                'reviews': 29,
                'bestseller': True,
                'in_stock': 12
            },
            {
                'name': 'Khukuri Knife Set',
                'description': 'Authentic Gurkha Khukuri with decorative sheath',
                'price': 480,
                'original_price': 650,
                'category_slug': 'handicrafts',
                'image': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
                'rating': 4.5,
                'reviews': 16,
                'bestseller': False,
                'in_stock': 10
            },
            {
                'name': 'Singing Bowl Set',
                'description': 'Hand-forged Tibetan singing bowl with wooden striker',
                'price': 380,
                'original_price': 520,
                'category_slug': 'handicrafts',
                'image': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
                'rating': 4.9,
                'reviews': 41,
                'bestseller': True,
                'in_stock': 18
            },
            {
                'name': 'Wood Carved Mask',
                'description': 'Traditional Bhairav mask used in cultural festivals',
                'price': 220,
                'original_price': 300,
                'category_slug': 'artwork',
                'image': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
                'rating': 4.4,
                'reviews': 8,
                'bestseller': False,
                'in_stock': 22
            },
        ]

        for product_data in products_data:
            category = Category.objects.get(slug=product_data.pop('category_slug'))
            
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    **product_data,
                    'category': category
                }
            )
            
            if created:
                self.stdout.write(f'Created product: {product.name}')
            else:
                # Update existing product
                for key, value in product_data.items():
                    if key != 'name':
                        setattr(product, key, value)
                product.category = category
                product.save()
                self.stdout.write(f'Updated product: {product.name}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with Nepali souvenir data!')
        )