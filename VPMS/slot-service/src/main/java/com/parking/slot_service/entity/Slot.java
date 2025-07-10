package com.parking.slot_service.entity;
 
import jakarta.persistence.*;
import lombok.*;
 
@Entity
@Table(name = "parking_slots")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Slot{
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slot_id")
    private Long slotId;
 
    @Column(nullable = false)
    private String location;  // Example: "A1", "B2"
 
    @Column(nullable = false)
    private String type; // "2W" or "4W"
 
    @Column(nullable = false)
    private boolean isOccupied;
}
 
