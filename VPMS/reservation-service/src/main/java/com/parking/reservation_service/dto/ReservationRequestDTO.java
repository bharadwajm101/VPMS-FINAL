package com.parking.reservation_service.dto;
 
import lombok.*;
 
import java.time.LocalDateTime;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequestDTO {
    private Long userId;
    private Long slotId;
    private String vehicleNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String type; // e.g., "PENDING", "CONFIRMED", "CANCELLED"
}