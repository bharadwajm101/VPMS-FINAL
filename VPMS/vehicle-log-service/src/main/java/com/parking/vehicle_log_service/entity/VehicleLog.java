package com.parking.vehicle_log_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_logs")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    private LocalDateTime exitTime;

    private Long userId; // foreign key to user-service

    private Long slotId;

    private Long durationMinutes;

//    @Column(nullable = false)
//    private boolean isActive = true; // optional soft delete
}
