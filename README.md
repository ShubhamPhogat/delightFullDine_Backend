# E-Commerce API Documentation

This API provides endpoints for user authentication, product management, and order processing in an e-commerce system.

## Table of Contents
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Product Management](#product-management)
  - [Order Management](#order-management)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following variables:
   ```
   MONGODB_URI=<your-mongodb-connection-string>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   JWT_SECRET=<your-jwt-secret>
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   The server will run on port 8000.

## API Endpoints

### Authentication

#### Register User
- **URL**: `/api/users/register`
- **Method**: `POST`
- **Request Body** (JSON):
  - `firstName`: String (required)
  - `lastName`: String (required)
  - `email`: String (required)
  - `userName`: String (required)
  - `phone`: String (required)
  - `password`: String (required)
  - `role`: String (optional, defaults to "user")
- **Success Response**: `200 OK` with user data
- **Error Response**: `400 Bad Request` if any field is missing, `500 Internal Server Error` for server errors

#### Login User
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Request Body** (JSON):
  - `email`: String (required)
  - `password`: String (required)
- **Success Response**: `200 OK` with user data and tokens
- **Error Response**: `400 Bad Request` for wrong credentials, `500 Internal Server Error` for server errors

#### Logout User
- **URL**: `/api/users/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK` with success message
- **Error Response**: `500 Internal Server Error` for server errors

#### Delete User
- **URL**: `/api/users/delete`
- **Method**: `POST`
- **Request Body** (JSON):
  - `email`: String (required)
- **Success Response**: `200 OK` with success message
- **Error Response**: `404 Not Found` if user not found, `500 Internal Server Error` for server errors

### Product Management

#### Create Product
- **URL**: `/api/product/create`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `productName`: String (required)
  - `productDescription`: String (required)
  - `productPrice`: Number (required)
  - `productCategory`: String (required)
  - `productStock`: Number (required)
  - `productTags`: Array of Strings (required)
  - `productImage`: File (required)
- **Success Response**: `201 Created` with product data
- **Error Response**: `400 Bad Request` if any field is missing, `500 Internal Server Error` for server errors

#### Get Products by Category
- **URL**: `/api/product/:category`
- **Method**: `GET`
- **Success Response**: `200 OK` with array of products
- **Error Response**: `400 Bad Request` if category missing, `500 Internal Server Error` for server errors

#### Update Product
- **URL**: `/api/product/`
- **Method**: `PUT`
- **Request Body** (JSON):
  - `productId`: String (required)
  - `productName`: String (required)
  - `productDescription`: String (required)
  - `productPrice`: Number (required)
  - `productCategory`: String (required)
  - `productStock`: Number (required)
  - `productTags`: Array of Strings (required)
- **Success Response**: `200 OK` with updated product
- **Error Response**: `400 Bad Request` if any field is missing, `500 Internal Server Error` for server errors

#### Delete Product
- **URL**: `/api/product/:productId`
- **Method**: `DELETE`
- **Success Response**: `200 OK` with success message
- **Error Response**: `400 Bad Request` if ID missing, `500 Internal Server Error` for server errors

### Order Management

#### Create Order
- **URL**: `/api/order/create`
- **Method**: `POST`
- **Request Body** (JSON):
  - `orderId`: String (required)
  - `userId`: String (required)
  - `orderTotal`: Number (required)
  - `orderItems`: Array of objects (required) - each containing:
    - `productId`: String
    - `quantity`: Number
- **Success Response**: `201 Created` with order data
- **Error Response**: `400 Bad Request` if any field is missing or stock unavailable, `500 Internal Server Error` for server errors

#### Get Orders by User ID
- **URL**: `/api/order/:id`
- **Method**: `GET`
- **Success Response**: `200 OK` with array of orders sorted by date
- **Error Response**: `400 Bad Request` if user not found, `500 Internal Server Error` for server errors

#### Cancel Order
- **URL**: `/api/order/cancel`
- **Method**: `POST`
- **Request Body** (JSON):
  - `orderId`: String (required)
- **Success Response**: `200 OK` with updated order
- **Error Response**: `400 Bad Request` if ID missing, `500 Internal Server Error` for server errors

## Notes
- All endpoints (except auth) require proper authentication via JWT
- Product images are handled via Cloudinary
- The API uses MongoDB for data storage
- CORS is enabled for all origins in the current configuration
