# MH Couture - E-commerce Platform for Personalized Fashion

## Project Overview

**MH Couture** is a complete web-based e-commerce platform developed for a bespoke tailoring and fashion design business operating in **Niamey, Niger**. The platform enables customers to browse personalized clothing collections, request custom-tailored garments based on personal measurements, and allows the business to efficiently manage orders, inventory, and customer relationships online.

## 🌐 Live Website

** [Visit MH Couture Live](http://169.239.251.102:341/~ibrahim.abdou/uploads/mh-couture/)**

- **Server IP**: 169.239.251.102:341
- **Status**: ✅ Active and Running
- **Server OS**: Ubuntu 24.04
- **PHP Version**: 8.3.6
- **MySQL Version**: 8.0.44

---

##  Key Features

###  For Customers

- **User Authentication** - Secure registration and login system
- **Product Catalog** - Browse 37+ ready-to-wear items with filtering by category
- **Custom Orders** - Submit tailored garment requests with measurements and preferences
- **Measurement Storage** - Save personal measurements for future orders
- **Shopping Cart** - Add/remove products, apply coupon codes
- **Order Tracking** - Monitor custom order status from submission to completion
- **Inspiration Gallery** - View 17+ showcase items of past custom creations
- **User Profile** - Manage personal information, saved measurements, order history
- **Direct Communication** - Contact form to reach the business

### For Administrators

- **Dashboard** - Real-time overview of platform metrics (products, orders, users, revenue)
- **Product Management** - Full CRUD operations with image uploads and categorization
- **Inventory Tracking** - Monitor stock levels across all products
- **Order Management** - Track and update order status
- **Custom Order Processing** - Manage custom requests with detailed specifications
- **Gallery Management** - Upload and organize design portfolio
- **User Management** - View customer profiles and data
- **Message Handling** - Process contact form inquiries
- **Analytics** - View business statistics and metrics
- **Settings** - Configure platform preferences

---

##  Technology Stack

### Frontend
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Responsive design for all devices (mobile, tablet, desktop)
- **JavaScript (ES6+)** - Interactive features, AJAX functionality, form validation
- **Responsive Design** - Mobile-first approach

### Backend
- **PHP 8.3** - Server-side processing and business logic
- **MySQL 8.0** - Relational database
- **PDO** - Secure database queries with prepared statements
- **REST API** - 20+ endpoints for frontend-backend communication

### Database (11 Tables)
- `users` - User accounts and admin roles
- `products` - Product catalog (37+ items)
- `cart` - Shopping cart items
- `orders` - Regular orders
- `order_items` - Order line items
- `custom_orders` - Custom tailoring requests (6 processed)
- `custom_measurements` - User measurement profiles
- `gallery` - Inspiration gallery images (17+ items)
- `contact_messages` - Customer inquiries
- `coupons` - Discount codes
- `password_resets` - Password recovery tokens

### Security
- **bcrypt** - Password hashing
- **CSRF Protection** - Security tokens for forms
- **SQL Injection Prevention** - PDO prepared statements
- **Session Management** - Secure user authentication
- **File Upload Validation** - Type and size checking

### Hosting & Deployment
- **Web Server**: Apache with mod_rewrite
- **Operating System**: Ubuntu 24.04
- **SSL/HTTPS**: Enabled
- **Database**: MySQL 8.0

---

##  Project Statistics

- **Files**: 50+
- **Lines of Code**: 10,000+
- **Database Tables**: 11
- **API Endpoints**: 20+
- **Frontend Pages**: 15+
- **Products in Catalog**: 37+
- **Gallery Items**: 17
- **Custom Orders Processed**: 6
- **Test Users**: 5
- **Code Coverage**: Backend 75%+, Frontend 60%+

---

##  Project Structure

```
mh-couture/
├── php/
│   ├── api/
│   │   ├── products.php
│   │   ├── cart.php
│   │   ├── orders.php
│   │   ├── custom-orders.php
│   │   ├── gallery.php
│   │   ├── contact.php
│   │   ├── search.php
│   │   ├── wishlist.php
│   │   ├── measurements.php
│   │   └── admin.php
│   ├── auth/
│   │   ├── auth.php
│   │   └── password-reset.php
│   ├── config/
│   │   ├── database.php
│   │   ├── EnvLoader.php
│   │   └── functions.php
│   └── includes/
│       └── functions.php
├── js/
│   ├── collections.js
│   ├── custom-designs.js
│   ├── cart.js
│   ├── profile.js
│   ├── gallery.js
│   ├── admin.js
│   ├── login.js
│   ├── signup.js
│   ├── contact.js
│   ├── search.js
│   ├── config.js
│   ├── auth-guard.js
│   └── translations.js
├── css/
│   ├── styles.css
│   ├── admin.css
│   ├── profile.css
│   └── etc....all the .css

├── images/
├── uploads/
├── .env.example
├── database.sql
├── index.php
├── collections.php
├── custom-designs.php
├── admin.php
├── profile.php
├── cart.php
├── gallery.php
├── contact.php
├── pricing.php
├── login.php
├── signup.php
├── logout.php
├── 404.php
└── README.md
```

---

##  Installation & Setup

### Prerequisites
- PHP 8.0+
- MySQL 8.0+
- Git
- Composer (optional)
- Apache or Nginx web server

### Step 1: Clone the Repository
```bash
public_html/uploads/ git clone https://github.com/Ibrahim8479/mh-couture.git
cd mh-couture
```

### Step 2: Configure Environment Variables
```bash
nano .env
# Edit .env with your database credentials
```

### Step 3: Create the Database
```bash
mysql -u root -p < database.sql
```

### Step 4: Configure Web Server

**For Apache:**
- Enable mod_rewrite: `a2enmod rewrite`
- Configure .htaccess file in project root
- Update Apache VirtualHost configuration

**For Nginx:**
- Configure nginx.conf with proper rewrite rules
- Set root directory to project folder

**For Local Testing:**
```bash
php -S localhost:8000
```

### Step 5: Access the Application
```
http:/http://169.239.251.102:341/~ibrahim.abdou/uploads/mh-couture
```

---

##  Test Accounts

### Admin Account
- **Email**: `Ibrahim@gmail.com`
- **Password**: `Ibrahim123`
- **Access**: Full admin panel with all management features

### Customer Account
- **Email**: `Mahamadou@gmail.com`
- **Password**: `Mahmadou123`
- **Access**: Regular customer features

---

##  API Endpoints

### Authentication
- `POST /php/auth/auth.php` - Login/Signup
- `POST /php/auth/password-reset.php` - Password reset

### Products
- `GET /php/api/products.php?action=getAll` - Get all products
- `GET /php/api/products.php?action=getById&id=X` - Get specific product
- `POST /php/api/products.php` - Create/update product (admin)
- `DELETE /php/api/products.php` - Delete product (admin)

### Cart
- `POST /php/api/cart.php` - Add to cart
- `GET /php/api/cart.php?action=getAll` - Get user cart
- `POST /php/api/cart.php` - Update cart quantity

### Custom Orders
- `POST /php/api/custom-orders.php` - Create custom order
- `GET /php/api/custom-orders.php?action=getAllCustomOrders` - Get all orders (admin)
- `PUT /php/api/custom-orders.php` - Update order status (admin)

### Gallery
- `GET /php/api/gallery.php?action=getAll` - Get all gallery items
- `POST /php/api/gallery.php` - Add gallery item (admin)
- `DELETE /php/api/gallery.php` - Delete gallery item (admin)

### Measurements
- `POST /php/api/measurements.php` - Save measurements
- `GET /php/api/measurements.php` - Get user measurements

### Contact
- `POST /php/api/contact.php` - Send contact message

---


### Test Coverage
- **Backend**: 75%+ coverage
- **Frontend**: 60%+ coverage

### Tested Features
- ✅ User authentication and authorization
- ✅ Product CRUD operations
- ✅ Shopping cart functionality
- ✅ Custom order processing
- ✅ Data validation
- ✅ File uploads

---

## 🎬 Demo Video

A complete demonstration video (max 10 minutes) is available showing:
1. Homepage and navigation
2. Product browsing and filtering
3. User registration and login
4. Shopping cart functionality
5. Custom order submission
6. User profile management
7. Admin dashboard
8. Product and gallery management
9. Order tracking // not yet finish

**[see Video demo ](https://youtu.be/QUrqnJHTFMw)**

---

## 📊 Database Schema

### Key Relationships
- Users → Orders (1:Many)
- Users → Cart (1:Many)
- Users → CustomOrders (1:Many)
- Users → CustomMeasurements (1:Many)
- Products → Cart (1:Many)
- Products → Orders (Many:Many through OrderItems)
- Orders → OrderItems (1:Many)
- Gallery → Images (1:Many)

### Indexes
- `users.email` - Unique email index
- `products.category` - Category filtering
- `orders.status` - Order status tracking
- `custom_orders.status` - Custom order status
- `gallery.is_featured` - Featured items

---

##  Security Features

### Authentication
- Secure password hashing with bcrypt
- Session token generation and validation
- Role-based access control (Customer vs Admin)

### Data Protection
- CSRF tokens for all forms
- PDO prepared statements prevent SQL injection
- Input sanitization and validation
- XSS prevention through escaping

### File Security
- File type validation for uploads
- File size restrictions
- Secure file storage outside web root
- Filename sanitization

### Server Security
- HTTPS/SSL enabled
- Secure session configuration
- Proper error handling (no stack traces to users)
- Regular security updates

---

##  Configuration

### .env File
```
DB_HOST=localhost
DB_USER=ibrahim.abdou
DB_PASS=IB80104091
DB_NAME=webtech_2025A_ibrahim_abdou

APP_URL=http://localhost/mh-couture
APP_ENV=production
APP_DEBUG=false

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_USER= Ibrahim@gmail.com
MAIL_PASS="" //password
```

---

##  Localization

- **Primary Language**: French (for Niger market)
---

##  Support & Contact

**Developer**: Ibrahim Abdou
- **Email**: Ibmahamadou@gmail.com
- **Phone**: +227 95642526
- **Location**: Niamey, Niger

---

## 🎓 Educational Value

This project demonstrates practical implementation of:
- Full-stack web development (Frontend, Backend, Database)
- E-commerce platform design
- REST API architecture
- Secure authentication and authorization
- Database design and optimization
- Responsive web design
- MVC principles
- Security best practices
- Real-world business logic

---

##  License

This project is an academic project for Web Technology course (Summer 2025). All rights reserved © 2025 MH Couture.

---

##  Acknowledgments

- **Instructor**: Web Technology Course 
- **Institution**: Ashesi 
- **Course**: Web Technology - Final Project
- **Year**: Summer 2025

---

##  Additional Resources

---

**Project Version**: 1.0.0  
**Last Updated**: December 17, 2025  
**Status**: ✅ Production Ready  
** AI use Deepseek,Claude for help
---


<div align="center">

### Made with  by Ibrahim Abdou
### Niamey, Niger 🇳🇪

**[Visit Live Site](http://169.239.251.102:341/~ibrahim.abdou/uploads/mh-couture/)**

</div>
