package com.parking.billing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleLogResponse {
    private Long logId;
    private String vehicleNumber;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String duration; // for hh:mm:ss format
    private Long userId;
    private Long slotId;
    // ...existing code...
    private String slotType;
   
}
