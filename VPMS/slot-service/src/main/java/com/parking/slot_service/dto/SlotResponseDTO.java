package com.parking.slot_service.dto;
 
import lombok.*;
 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlotResponseDTO {
    private Long slotId;
    private String location;
    private String type;
    private boolean isOccupied;

    public SlotResponseDTO(Long slotId, String location, String type) {
        this.slotId = slotId;
        this.location = location;
        this.type = type;
        this.isOccupied = false; // Default to false for new slots
    }
}