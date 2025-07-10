# API Documentation: User Endpoints

## User Registration

**Endpoint:**
`Post http://localhost:8081/api/user/register`

**Content-Type:**
`application/json`

**Request Body**
```json
{
  "name": "Vaishnavi",
  "email": "vaishhuu123@gmail.com",
  "password": "Vaishnavi@123"
}
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 6,
    "name": "Vaishnavi",
    "email": "vaishhuu123@gmail.com",
    "role": "CUSTOMER"
  }
}

```

---

## User Login

**Endpoint:**
`Post http://localhost:8081/api/user/login`

**Content-Type:**
`application/json`

**Request Body**
```json
{
  "email": "vaishhuu123@gmail.com",
  "password": "Vaishnavi@123"
}
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ2YWlzaGh1dTEyM0BnbWFpbC5jb20iLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE3NTE2MTEyNzMsImV4cCI6MTc1MTY0NzI3M30.ddEES9k7kpCjyryPe2RPQd8vIm65Rn2F6VsRe7eshIs",
  "role": "CUSTOMER",
  "user": {
    "id": 6,
    "name": "Vaishnavi",
    "email": "vaishhuu123@gmail.com",
    "role": "CUSTOMER"
  }
}

```

---

## Admin Login

**Endpoint:**
`Post http://localhost:8081/api/user/login`

**Content-Type:**
`application/json`

**Request Body**
```json
{
  "email": "admin@vpm.com",
  "password": "admin123"
}
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB2cG0uY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzUxNjExMjgwLCJleHAiOjE3NTE2NDcyODB9.okPG8Td0AK_hl61ucT0-7-im8xRoRvw7AztlRGZkXO8",
  "role": "ADMIN",
  "user": {
    "id": 2,
    "name": "Admin",
    "email": "admin@vpm.com",
    "role": "ADMIN"
  }
}
```

---

## Staff Login

**Endpoint:**
`Post http://localhost:8081/api/user/login`

**Content-Type:**
`application/json`

**Request Body**
```json
{
  "email": "staff@vpm.com",
  "password": "staff123"
}
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdGFmZkB2cG0uY29tIiwicm9sZSI6IlNUQUZGIiwiaWF0IjoxNzUxNjExMjgzLCJleHAiOjE3NTE2NDcyODN9.zCS4Nzw8c_UB6CG11MXZaDcB8G9SzmaqXB3ycgq08Ec",
  "role": "STAFF",
  "user": {
    "id": 3,
    "name": "Staff",
    "email": "staff@vpm.com",
    "role": "STAFF"
  }
}

```

---

## Get All Users

**Endpoint:**
`Get http://localhost:8081/api/user/all`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Admin token>`

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Bharadwajm",
      "email": "Bharadwajm101@gmail.com",
      "role": "CUSTOMER"
    },
    {
      "id": 2,
      "name": "Admin",
      "email": "admin@vpm.com",
      "role": "ADMIN"
    },
    {
      "id": 3,
      "name": "Staff",
      "email": "staff@vpm.com",
      "role": "STAFF"
    },
    {
      "id": 5,
      "name": "Bharadwajm2",
      "email": "Bharadwajm1012@gmail.com",
      "role": "STAFF"
    },
    {
      "id": 6,
      "name": "Vaishnavi",
      "email": "vaishhuu123@gmail.com",
      "role": "CUSTOMER"
    }
  ]
}
```

---

## Get Users by Profile

**Endpoint:**
`Get http://localhost:8081/api/user/profile`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Admin token, Staff token, User token>`

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "id": 6,
  "name": "Vaishnavi",
  "email": "vaishhuu123@gmail.com",
  "role": "CUSTOMER"
}
```

---

## Update Users by Id

**Endpoint:**
`Put http://localhost:8081/api/user/5`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Admin token>`

**Request Body**
```json
{
    "id": 5,
    "name": "Bharadwajm2",
    "email": "Bharadwajm1012@gmail.com",
    "role": "STAFF"
}
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "user": {
    "id": 5,
    "name": "Bharadwajm2",
    "email": "Bharadwajm1012@gmail.com",
    "role": "STAFF"
  },
  "message": "User updated"
}
```

---

## Get Users by Id

**Endpoint:**
`Get http://localhost:8081/api/user/5`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Admin token, Staff token, User token>`

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "user": {
    "id": 5,
    "name": "Bharadwajm2",
    "email": "Bharadwajm1012@gmail.com",
    "role": "STAFF"
  }
}
```

---

## Delete Users by Id

**Endpoint:**
`Delete http://localhost:8081/api/user/4`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Admin token>`

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "message": "User deleted successfully"
}
```

---

