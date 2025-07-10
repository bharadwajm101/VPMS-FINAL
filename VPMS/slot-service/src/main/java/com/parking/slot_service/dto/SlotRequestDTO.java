package com.parking.slot_service.dto;

import lombok.*;
 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlotRequestDTO {
    private String location;
    private String type;       // "2W" or "4W"
    private Boolean isOccupied; // Used only in updates (optional)
}
 