# API Documentation: Slot Endpoints

## Creating New Slots 
**Endpoint:**  
`Post http://localhost:8082/api/slots`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token>`

**Request Body:**  
```json
{
  "location": "B11",
  "type": "4W"
}
```

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "slot": {
    "slotId": 9,
    "location": "B11",
    "type": "4W",
    "occupied": false
  },
  "message": "Slot added successfully"
}

  ```

---

## Deleting Slots by Id
**Endpoint:**  
`DELETE http://localhost:8082/api/slots/9`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "message": "Slot deleted successfully"
}

  ```

---

## Get All the Slots
**Endpoint:**  
`Get http://localhost:8082/api/slots`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "message": "All slots retrieved successfully",
  "slots": [
    {
      "slotId": 1,
      "location": "A1",
      "type": "2W",
      "occupied": false
    },
    {
      "slotId": 2,
      "location": "A2",
      "type": "2W",
      "occupied": false
    },
    {
      "slotId": 3,
      "location": "A3",
      "type": "2W",
      "occupied": false
    },
    {
      "slotId": 4,
      "location": "B1",
      "type": "4W",
      "occupied": false
    },
  ]
}

  ```

---

## Update Slots by Id
**Endpoint:**
`Put http://localhost:8082/api/slots/6`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Staff token>`

**Request Body**
```json
{
      "location": "B3",
      "type": "4W",
      "isOccupied": true
}
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "slot": {
    "slotId": 6,
    "location": "B3",
    "type": "4W",
    "occupied": true
  },
  "message": "Slot status updated"
}
```

---

## Get Available Slots
**Endpoint:**  
`Get http://localhost:8082/api/slots/available`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "message": "Available slots fetched",
  "slots": [
    {
      "slotId": 1,
      "location": "A1",
      "type": "2W",
      "occupied": false
    },
    {
      "slotId": 2,
      "location": "A2",
      "type": "2W",
      "occupied": false
    },
    {
      "slotId": 3,
      "location": "A3",
      "type": "2W",
      "occupied": false
    },
  ]
}
  ```

---

## Get Available Slots based on the Vehicle Type
**Endpoint:**  
`Get http://localhost:8082/api/slots/available/type/4w`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token, Staff token, User token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "message": "Available slots of type 4w fetched",
  "slots": [
    {
      "slotId": 4,
      "location": "B1",
      "type": "4W",
      "occupied": false
    },
    {
      "slotId": 5,
      "location": "B2",
      "type": "4W",
      "occupied": false
    },
    {
      "slotId": 8,
      "location": "B3",
      "type": "4W",
      "occupied": false
    }
  ]
}
  ```

---

## Update Slot by Particular SlotId
**Endpoint:**
`Put http://localhost:8082/api/slots/slot/8`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Admin token, Staff token>`

**Request Body**
```json
   {
      "occupied": false
    }
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "slot": {
    "slotId": 8,
    "location": "B3",
    "type": "4W",
    "occupied": false
  }
}
```

---