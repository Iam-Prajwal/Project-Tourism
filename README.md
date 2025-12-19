# 🏛️ Nepal Heritage & Tourism Platform

A comprehensive Django-based web application for exploring Nepal's cultural heritage, tourism services, local cuisine, and souvenir shopping. This platform connects travelers with authentic Nepali experiences through community-driven content, interactive maps, and integrated tourism services.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![Django](https://img.shields.io/badge/Django-5.2-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

### 🗺️ Heritage Sites & Tourism
- **Interactive site exploration** with detailed descriptions, history, and cultural significance
- **Map integration** using Baato API for Nepal-specific directions and nearby places
- **Nearby services discovery** (accommodations, restaurants, transportation)
- **Personal wishlist** to save favorite destinations

### 🍛 Local Cuisine Guide
- **Traditional food catalog** with recipes, ingredients, and nutritional information
- **Historical significance** of Nepali dishes
- **Video tutorials** for cooking traditional recipes
- **Restaurant finder** and online ordering links
- **Ingredient shop locator** with both physical and online store options

### 🎉 Events & Festivals
- **Upcoming events calendar** featuring festivals, workshops, and cultural gatherings
- **Event filtering** by category, type, and status
- **Event galleries** and detailed event information
- **Map directions** to event locations

### 🛍️ Souvenir Shop
- **Product catalog** with categories, search, and filtering
- **Shopping cart** with session and user-based management
- **Wishlist functionality** for products
- **Product reviews and ratings**
- **eSewa payment integration** for Nepal
- **Order management** and email notifications

### 👥 Community Features
- **Travel experience sharing** with photos and location tagging
- **Heritage site contributions** for community-sourced content
- **Content verification system** for quality control

### 🌤️ Weather Information
- **Real-time weather data** for any location
- **5-day weather forecast** for trip planning

### 🤖 AI Chatbot Assistant
- **Dedicated website chatbot** for instant visitor assistance
- **Interactive guidance** for navigating the platform
- **Quick answers** to common tourism and heritage queries

### 🔐 Authentication
- **User registration and login**
- **Google OAuth integration** for social login
- **Password reset via email**
- **User profile management**

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Iam-Prajwal/Project-Tourism.git
   cd Project-Tourism-main
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the project root with the following variables:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   
   # Google OAuth
   SOCIAL_AUTH_URL_NAMESPACE=social
   SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=your-google-client-id
   SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=your-google-client-secret
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   
   # API Keys
   OPENWEATHERMAP_API_KEY=your-openweathermap-api-key
   BAATO_API_KEY=your-baato-api-key
   
   # eSewa Payment (Nepal)
   ESEWA_BASE_URL=https://uat.esewa.com.np/epay/main
   ESEWA_MERCHANT_ID=your-merchant-id
   ESEWA_VERIFY_URL=https://uat.esewa.com.np/epay/transrec
   ```

5. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the application**
   - Main site: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/

---

## 📁 Project Structure

```
Project-Tourism-main/
├── Auth/                   # Django project settings
│   ├── settings.py         # Main configuration
│   ├── urls.py             # Root URL routing
│   └── wsgi.py             # WSGI configuration
├── main/                   # Core application
│   ├── models.py           # Database models (Sites, Food, Events, etc.)
│   ├── views.py            # View functions
│   ├── urls.py             # URL patterns
│   ├── templates/          # HTML templates
│   └── static/             # CSS, JS, images
├── souvenirs/              # E-commerce module
│   ├── models.py           # Product, Cart, Order models
│   ├── views.py            # Shop functionality
│   └── templates/          # Shop templates
├── media/                  # User-uploaded files
├── staticfiles/            # Collected static files
├── requirements.txt        # Python dependencies
└── manage.py               # Django management script
```

---

## 🔧 Configuration

### API Keys Required

| Service | Purpose | Get API Key |
|---------|---------|-------------|
| OpenWeatherMap | Weather data | [openweathermap.org](https://openweathermap.org/api) |
| Baato | Nepal maps & directions | [baato.io](https://baato.io/) |
| Google OAuth | Social login | [Google Cloud Console](https://console.cloud.google.com/) |
| eSewa | Payment processing | [esewa.com.np](https://esewa.com.np/) |

### Database

The project uses SQLite by default. For production, configure PostgreSQL in `Auth/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Maintainers

- **Prajwal Sah** - [GitHub](https://github.com/Iam-Prajwal)

---

## 📄 License

This project is open source. See the repository for license details.

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Iam-Prajwal/Project-Tourism.git/issues) page
2. Create a new issue with detailed information about your problem
3. Include steps to reproduce, expected behavior, and actual behavior

---

## 🙏 Acknowledgments

- [Django](https://www.djangoproject.com/) - The web framework used
- [Baato](https://baato.io/) - Nepal-specific mapping services
- [OpenWeatherMap](https://openweathermap.org/) - Weather data API
- [eSewa](https://esewa.com.np/) - Nepal's digital payment platform
