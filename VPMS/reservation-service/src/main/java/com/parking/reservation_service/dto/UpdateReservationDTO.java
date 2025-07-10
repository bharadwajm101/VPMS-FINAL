package com.parking.reservation_service.dto;
 
import lombok.*;
 
import java.time.LocalDateTime;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReservationDTO {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String vehicleNumber;
}