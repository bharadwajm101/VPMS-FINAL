package com.parking.slot_service.service.impl;
 
import com.parking.slot_service.dto.*;

import com.parking.slot_service.entity.Slot;
import com.parking.slot_service.repository.SlotRepository;
import com.parking.slot_service.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
 
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {
 
    private final SlotRepository slotRepository;

    @Override
    public SlotResponseDTO addSlot(SlotRequestDTO requestDTO) {
        if (!"2W".equals(requestDTO.getType()) && !"4W".equals(requestDTO.getType())) {
            throw new IllegalArgumentException("Invalid slot type. Only '2W' or '4W' allowed.");
        }
        Slot slot = new Slot();
        slot.setLocation(requestDTO.getLocation());
        slot.setType(requestDTO.getType());
        slot.setOccupied(false); // By default, new slot is empty
 
        Slot saved = slotRepository.save(slot);
        return mapToDTO(saved);
    }
 
    @Override
    public void deleteSlot(Long slotId) {
        slotRepository.deleteById(slotId);
    }
 
    @Override
    public SlotResponseDTO updateSlot(Long slotId, SlotRequestDTO requestDTO) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
 
        if (requestDTO.getIsOccupied() != null) {
            slot.setOccupied(requestDTO.getIsOccupied());
        }
 
        Slot updated = slotRepository.save(slot);
        return mapToDTO(updated);
    }
 
    @Override
    public List<SlotResponseDTO> getAvailableSlots() {
        return slotRepository.findByIsOccupiedFalse().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
 
    @Override
    public List<SlotResponseDTO> getAllSlots() {
        return slotRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
 
    private SlotResponseDTO mapToDTO(Slot slot) {
        return new SlotResponseDTO(
                slot.getSlotId(),
                slot.getLocation(),
                slot.getType(),
                slot.isOccupied()
        );
    }
    @Override
    public List<SlotResponseDTO> getAvailableSlotsByType(String type) {
    return slotRepository.findByTypeAndIsOccupiedFalse(type).stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
}

@Override
public SlotResponseDTO updateSlotOccupancy(Long slotId, Boolean occupied) {
    Slot slot = slotRepository.findById(slotId)
        .orElseThrow(() -> new RuntimeException("Slot not found"));
    
    System.out.println("Slot " + slotId + " current status: " + (slot.isOccupied() ? "OCCUPIED" : "AVAILABLE"));
    System.out.println("Updating slot " + slotId + " to: " + (occupied ? "OCCUPIED" : "AVAILABLE"));
    
    slot.setOccupied(occupied);
    slotRepository.save(slot);
    
    System.out.println("✓ Slot " + slotId + " successfully updated in database");
    return mapToDTO(slot);
}

@Override
public SlotResponseDTO getSlotById(Long slotId) {
    Slot slot = slotRepository.findById(slotId)
        .orElseThrow(() -> new RuntimeException("Slot not found"));
    return mapToDTO(slot);
}

}
 