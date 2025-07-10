package com.parking.vehicle_log_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VehicleEntryRequest {
    private String vehicleNumber;
    private Long userId;
    private Long slotId;
}
