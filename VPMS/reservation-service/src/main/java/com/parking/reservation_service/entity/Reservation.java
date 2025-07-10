package com.parking.reservation_service.entity;
 
import jakarta.persistence.*;
import lombok.*;
 
import java.time.LocalDateTime;
 
@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long reservationId;
 
    @Column(nullable = false)
    private Long userId;
 
    @Column(nullable = false)
    private Long slotId;
 
    @Column(nullable = false)
    private String vehicleNumber;
 
    @Column(nullable = false)
    private LocalDateTime startTime;
 
    @Column(nullable = false)
    private LocalDateTime endTime;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status; 
    
    @Column(nullable = false)                    
    private String type;

}
 