# API Documentation: Reservation Endpoints

## User Reserving a Slot

**Endpoint:**

`Post http://localhost:8084/api/reservations`

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <customer token>`

### Request Body
```json
{
  "userId": 1,
  "slotId": 5,
  "vehicleNumber": "KA40ES1890",
  "startTime": "2025-07-04T08:49:05",
  "endTime": "2025-07-04T08:50:05",
  "type": "4W"
}
```

### Response
**Status Code:** 200  
**Example Response Body:**
```json

  {
  "message": "Reservation created successfully",
  "reservation": {
    "reservationId": 1,
    "userId": 1,
    "slotId": 5,
    "vehicleNumber": "KA40ES1890",
    "startTime": "2025-07-04T08:49:05",
    "endTime": "2025-07-04T08:50:05",
    "status": "ACTIVE",
    "type": "4W",
    "durationMinutes": 1
  }
}

```

---

## Get  Reservations by ReservationId

**Endpoint:**  
`Get http://localhost:8084/api/reservations/1`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token,customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "reservationId": 1,
  "userId": 1,
  "slotId": 5,
  "vehicleNumber": "KA40ES1890",
  "startTime": "2025-07-04T08:49:05",
  "endTime": "2025-07-04T08:50:05",
  "status": "ACTIVE",
  "type": "4W",
  "durationMinutes": 1
}
  ```

---

## Update Reservations by Id

**Endpoint:**
`Put http://localhost:8084/api/reservations/1`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <customer token, admin token>`

**Request Body**
```json
 {
  "userId": 6,
  "slotId": 5,
  "vehicleNumber": "hjgsd53",
  "startTime": "2025-07-04T09:20:33.962Z",
  "endTime": "2025-07-04T09:20:33.962Z",
  "type": "4w"
}
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "message": "Reservation updated successfully",
  "reservation": {
    "reservationId": 1,
    "userId": 1,
    "slotId": 5,
    "vehicleNumber": "hjgsd53",
    "startTime": "2025-07-04T09:20:33.962",
    "endTime": "2025-07-04T09:20:33.962",
    "status": "ACTIVE",
    "type": "4w",
    "durationMinutes": 0
  }
}
```

---

## Get Reservations by UserId

**Endpoint:**  
`Get http://localhost:8084/api/reservations/user/1`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token,customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "userId": 6,
  "slotId": 5,
  "vehicleNumber": "hjgsd53",
  "startTime": "2025-07-04T09:20:33.962Z",
  "endTime": "2025-07-04T09:20:33.962Z",
  "type": "4w"
}
  ```

---

## Delete Reservations by Id

**Endpoint:**
`Delete http://localhost:8084/api/reservations/1`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <customer token, admin token>`

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "message": "Reservation cancelled successfully"
}
```

---

## Get All the Reservations 

**Endpoint:**  
`Get http://localhost:8084/api/reservations`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token,customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
[
  {
    "reservationId": 1,
    "userId": 1,
    "slotId": 5,
    "vehicleNumber": "hjgsd53",
    "startTime": "2025-07-04T09:20:33.962",
    "endTime": "2025-07-04T09:20:33.962",
    "status": "CANCELLED",
    "type": "4w",
    "durationMinutes": 0
  }
]
  ```

---