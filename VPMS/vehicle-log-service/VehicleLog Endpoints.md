# API Documentation: VehicleLog Endpoints

## Posting the Details while Vehicle Entry

**Endpoint:**

`Post http://localhost:8083/api/vehicle-log/entry`

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token, Staff token>`

### Request Body
```json
{
  "vehicleNumber": "ka20es1518",
  "userId": 6,
  "slotId": 1
}
```

### Response
**Status Code:** 200  
**Example Response Body:**
```json

  {
  "log": {
    "logId": 3,
    "vehicleNumber": "ka20es1518",
    "entryTime": "2025-07-04T13:04:46.5158662",
    "exitTime": null,
    "duration": null,
    "userId": 6,
    "slotId": 1,
    "slotType": "2W"
  },
  "message": "Vehicle entry recorded"
}

```

---

## Exiting the Vehicle 

**Endpoint:**

`Post http://localhost:8083/api/vehicle-log/exit`

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token, Staff token>`

### Request Body
```json
{
  "logId":3
}
```

### Response
**Status Code:** 200  
**Example Response Body:**
```json
{
  "log": {
    "logId": 3,
    "vehicleNumber": "ka20es1518",
    "entryTime": "2025-07-04T13:04:46.515866",
    "exitTime": "2025-07-04T13:08:21.9541849",
    "duration": "00:03:35",
    "userId": 6,
    "slotId": 1,
    "slotType": "2W"
  },
  "message": "Vehicle exit recorded"
}

```

---

## Get All the Details of Entered Vehicles

**Endpoint:**  
`Get http://localhost:8083/api/vehicle-log`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
  "count": 2,
  "logs": [
    {
      "logId": 1,
      "vehicleNumber": "ka20es1518",
      "entryTime": "2025-07-03T10:57:02.128646",
      "exitTime": "2025-07-03T11:07:49.321038",
      "duration": "00:10:47",
      "userId": 5,
      "slotId": 5,
      "slotType": "4W"
    },
    {
      "logId": 2,
      "vehicleNumber": "ka20es1518",
      "entryTime": "2025-07-03T10:58:18.150808",
      "exitTime": null,
      "duration": null,
      "userId": 5,
      "slotId": 4,
      "slotType": "4W"
    }
  ]
}
  ```

---

## Get Vehicle Details by LogId

**Endpoint:**  
`Get http://localhost:8083/api/vehicle-log/1`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
{
    {
      "logId": 1,
      "vehicleNumber": "ka20es1518",
      "entryTime": "2025-07-03T10:57:02.128646",
      "exitTime": "2025-07-03T11:07:49.321038",
      "duration": "00:10:47",
      "userId": 5,
      "slotId": 5,
      "slotType": "4W"
    }
}
  ```

---

## Update Vehicle Details by LogId

**Endpoint:**
`Put http://localhost:8083/api/vehicle-log/1`

**Content-Type:**
`application/json`

**Headers:**  
`Authorization: Bearer <Admin token, Staff token>`

**Request Body**
```json
  {
      "logId": 1,
      "vehicleNumber": "ka20es1519",
      "entryTime": "2025-07-03T10:57:02.128646",
      "exitTime": "2025-07-03T11:07:49.321038",
      "duration": "00:10:47",
      "userId": 5,
      "slotId": 5,
      "slotType": "4W"
    }
```

**Response:**
- **Status Code:** `200`
- **Message:**
```json
{
  "log": {
    "logId": 1,
    "vehicleNumber": "ka20es1519",
    "entryTime": "2025-07-03T10:57:02.128646",
    "exitTime": "2025-07-03T11:07:49.321038",
    "duration": "00:10:47",
    "userId": 5,
    "slotId": 5,
    "slotType": "4W"
  },
  "message": "Vehicle log updated"
}
```

---

## Get the Details of the Vehicle by UserId
**Endpoint:**  
`Get http://localhost:8083/api/vehicle-log/user/5`  

**Content-Type:**  
`application/json`  

**Headers:**  
`Authorization: Bearer <Admin token, staff token,customer token>`

**Response:**  
- **Status Code:** `200`  
- **Message:** 
```json 
[
  {
    "logId": 1,
    "vehicleNumber": "ka20es15819",
    "entryTime": "2025-07-03T10:57:02.128646",
    "exitTime": "2025-07-03T11:07:49.321038",
    "duration": "00:10:47",
    "userId": 5,
    "slotId": 5,
    "slotType": "4W"
  },
  {
    "logId": 2,
    "vehicleNumber": "ka20es1518",
    "entryTime": "2025-07-03T10:58:18.150808",
    "exitTime": null,
    "duration": null,
    "userId": 5,
    "slotId": 4,
    "slotType": "4W"
  }
]
  ```

---