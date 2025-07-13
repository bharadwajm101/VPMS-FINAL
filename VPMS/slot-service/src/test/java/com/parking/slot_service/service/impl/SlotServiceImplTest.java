package com.parking.slot_service.service.impl;

import com.parking.slot_service.dto.SlotRequestDTO;
import com.parking.slot_service.dto.SlotResponseDTO;
import com.parking.slot_service.entity.Slot;
import com.parking.slot_service.repository.SlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SlotServiceImplTest {

    @Mock
    private SlotRepository slotRepository;

    @InjectMocks
    private SlotServiceImpl slotService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // SM_001: Add new parking slot
@Test
void addSlot_validDetails_slotAdded() {
    SlotRequestDTO req = new SlotRequestDTO();
    req.setLocation("A1");
    req.setType("2W");
    Slot slot = new Slot();
    slot.setSlotId(1L);
    slot.setLocation("A1");
    slot.setType("2W");
    slot.setOccupied(false);

    when(slotRepository.save(any(Slot.class))).thenReturn(slot);

    SlotResponseDTO res = slotService.addSlot(req);

    assertEquals("A1", res.getLocation());
    assertEquals("2W", res.getType());
    assertFalse(res.isOccupied());
}

    // SM_002: Add slot with duplicate ID
    @Test
    void addSlot_duplicateId_throwsException() {
        SlotRequestDTO req = new SlotRequestDTO();
        req.setLocation("A1");
        req.setType("CAR");

        when(slotRepository.save(any(Slot.class))).thenThrow(new RuntimeException("Slot ID already exists"));

        assertThrows(RuntimeException.class, () -> slotService.addSlot(req));
    }

    // SM_004: Delete a parking slot
    @Test
    void deleteSlot_validId_slotDeleted() {
        doNothing().when(slotRepository).deleteById(1L);
        assertDoesNotThrow(() -> slotService.deleteSlot(1L));
    }

    // SM_005: View real-time availability
    @Test
    void getAvailableSlots_returnsAvailableSlots() {
        Slot slot = new Slot();
        slot.setSlotId(1L);
        slot.setLocation("A1");
        slot.setType("CAR");
        slot.setOccupied(false);

        when(slotRepository.findByIsOccupiedFalse()).thenReturn(List.of(slot));

        List<SlotResponseDTO> slots = slotService.getAvailableSlots();
        assertEquals(1, slots.size());
        assertFalse(slots.get(0).isOccupied());
    }

    // SM_006: Occupy a slot
    @Test
    void updateSlotOccupancy_occupySlot_statusChanged() {
        Slot slot = new Slot();
        slot.setSlotId(1L);
        slot.setOccupied(false);

        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(Slot.class))).thenReturn(slot);

        SlotResponseDTO res = slotService.updateSlotOccupancy(1L, true);
        assertTrue(res.isOccupied());
    }

    // SM_007: Free a slot
    @Test
    void updateSlotOccupancy_freeSlot_statusChanged() {
        Slot slot = new Slot();
        slot.setSlotId(1L);
        slot.setOccupied(true);

        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(slotRepository.save(any(Slot.class))).thenReturn(slot);

        SlotResponseDTO res = slotService.updateSlotOccupancy(1L, false);
        assertFalse(res.isOccupied());
    }

    // SM_008: Add slot with invalid type
    @Test
    void addSlot_invalidType_throwsException() {
        SlotRequestDTO req = new SlotRequestDTO();
        req.setLocation("A1");
        req.setType("TRUCK"); // Invalid type
    
        assertThrows(IllegalArgumentException.class, () -> slotService.addSlot(req));
    }
    
}