package com.parking.slot_service.service;
 
import java.util.List;

import com.parking.slot_service.dto.SlotRequestDTO;
import com.parking.slot_service.dto.SlotResponseDTO;
 
public interface SlotService {
 
    SlotResponseDTO addSlot(SlotRequestDTO requestDTO);
 
    void deleteSlot(Long slotId);
 
    List<SlotResponseDTO> getAvailableSlots();
    
    SlotResponseDTO updateSlot(Long slotId, SlotRequestDTO requestDTO);
 
    List<SlotResponseDTO> getAllSlots();

    List<SlotResponseDTO> getAvailableSlotsByType(String type);

    SlotResponseDTO updateSlotOccupancy(Long slotId, Boolean occupied);

    SlotResponseDTO getSlotById(Long slotId);

}
 