# API Documentation: Billing Endpoints

## Request for Bill Generation

**Endpoint:**  
`post http://localhost:8085/api/billing`

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <customer token, admin token>`

### Request Body
```json
{
  "userId": 1,
  "reservationId": 1,
  "logId": null,
  "timestamp": "2025-07-04T09:28:28.519Z",
  "paymentMethod": "UPI"
}
```

### Response
**Status Code:** 200  
**Example Response Body:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "invoiceId": 6,
    "userId": 1,
    "reservationId": 1,
    "logId": null,
    "type": "4w",
    "amount": 0.0,
    "paymentMethod": "UPI",
    "status": "UNPAID",
    "timestamp": "2025-07-04T09:28:28.519"
  }
}

```

---

## Get Billing Details by InvoiceId

**Endpoint:**  
`Get http://localhost:8085/api/billing/1`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token,customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "success": true,
  "message": "Invoice fetched successfully",
  "data": {
    "invoiceId": 1,
    "userId": 1,
    "reservationId": 1,
    "logId": null,
    "type": "4w",
    "amount": 0.0,
    "paymentMethod": "UPI",
    "status": "UNPAID",
    "timestamp": "2025-07-04T09:28:28.519"
  }
}
  ```

---

## Paying the Bill based on InvoiceId

**Endpoint:**  
`Post http://localhost:8085/api/billing/2/pay`

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <customer token, admin token>`

### Request Body
```json
{
  "paymentMethod": "CASH"
}
```

### Response
**Status Code:** 200  
**Example Response Body:**
```json
{
  "success": true,
  "message": "Invoice paid successfully",
  "data": {
    "invoiceId": 2,
    "userId": 1,
    "reservationId": 1,
    "logId": null,
    "type": "4w",
    "amount": 0.0,
    "paymentMethod": "CASH",
    "status": "PAID",
    "timestamp": "2025-07-04T09:28:28.519"
  }
}

```

---

## Cancelling the Bill based on InvoiceId

**Endpoint:**  
`Post http://localhost:8085/api/billing/3/cancel`

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <customer token, admin token>`

### Request Body
```json
{
  "paymentMethod": "CASH"
}
```

### Response
**Status Code:** 200  
**Example Response Body:**
```json
{
  "success": true,
  "message": "Invoice cancelled successfully",
  "data": {
    "invoiceId": 3,
    "userId": 1,
    "reservationId": 1,
    "logId": null,
    "type": "4w",
    "amount": 0.0,
    "paymentMethod": "UPI",
    "status": "CANCELLED",
    "timestamp": "2025-07-04T09:28:28.519"
  }
}
```

---

## Get All the Bill Details

**Endpoint:**  
`Get http://localhost:8085/api/billing`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token,customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "success": true,
  "message": "All invoices retrieved",
  "data": [
    {
      "invoiceId": 1,
      "userId": 1,
      "reservationId": 1,
      "logId": null,
      "type": "4w",
      "amount": 0.0,
      "paymentMethod": "CASH",
      "status": "PAID",
      "timestamp": "2025-07-04T09:28:28.519"
    },
    {
      "invoiceId": 2,
      "userId": 1,
      "reservationId": 1,
      "logId": null,
      "type": "4w",
      "amount": 0.0,
      "paymentMethod": "CASH",
      "status": "PAID",
      "timestamp": "2025-07-04T09:28:28.519"
    }
  ]
}
  ```

---

## Get Billing Details based on UserId

**Endpoint:**  
`Get http://localhost:8085/api/billing/user/1`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "success": true,
  "message": "User invoices retrieved",
  "data": [
    {
      "invoiceId": 1,
      "userId": 1,
      "reservationId": 1,
      "logId": null,
      "type": "4w",
      "amount": 0.0,
      "paymentMethod": "CASH",
      "status": "PAID",
      "timestamp": "2025-07-04T09:28:28.519"
    },
    {
      "invoiceId": 2,
      "userId": 1,
      "reservationId": 1,
      "logId": null,
      "type": "4w",
      "amount": 0.0,
      "paymentMethod": "CASH",
      "status": "PAID",
      "timestamp": "2025-07-04T09:28:28.519"
    }
  ]
}
  ```

---
