package com.parking.slot_service.controller;
 
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parking.slot_service.dto.SlotRequestDTO;
import com.parking.slot_service.dto.SlotResponseDTO;
import com.parking.slot_service.service.SlotService;

import lombok.RequiredArgsConstructor;
 
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {
 
    private final SlotService slotService;
 
    // ✅ 1. Add a new parking slot [ADMIN only]
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> addSlot(@RequestBody SlotRequestDTO requestDTO) {
        SlotResponseDTO slot = slotService.addSlot(requestDTO);
 
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Slot added successfully");
        response.put("slot", slot);
        return ResponseEntity.ok(response);
    }
 
    // ✅ 2. Delete a parking slot [ADMIN only]
    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteSlot(@PathVariable Long slotId) {
        slotService.deleteSlot(slotId);
 
        return ResponseEntity.ok(Map.of(
            "message", "Slot deleted successfully"
        ));
    }
 
    // ✅ 3. Update slot availability [STAFF only]
    @PutMapping("{slotId}")
    @PreAuthorize("hasAuthority('STAFF')")
    public ResponseEntity<Map<String, Object>> updateSlot(@PathVariable Long slotId,
                                                           @RequestBody SlotRequestDTO requestDTO) {
        SlotResponseDTO updated = slotService.updateSlot(slotId, requestDTO);
 
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Slot status updated");
        response.put("slot", updated);
        return ResponseEntity.ok(response);
    }
 
    // 4. Get all available slots [CUSTOMER only]
    @GetMapping("/available")
    @PreAuthorize("hasAnyAuthority('STAFF','CUSTOMER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAvailableSlots() {
        List<SlotResponseDTO> slots = slotService.getAvailableSlots();
 
        return ResponseEntity.ok(Map.of(
            "message", "Available slots fetched",
            "slots", slots
        ));
    }
 
    // ✅ 5. Get all slots (both occupied and unoccupied) [ADMIN only]
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getAllSlots() {
        List<SlotResponseDTO> allSlots = slotService.getAllSlots();
 
        return ResponseEntity.ok(Map.of(
            "message", "All slots retrieved successfully",
            "slots", allSlots
        ));
    }


// ✅ 6. Get available slots by type (open to all)
@GetMapping("/available/type/{type}")
public ResponseEntity<Map<String, Object>> getAvailableSlotsByType(@PathVariable String type) {
    List<SlotResponseDTO> slots = slotService.getAvailableSlotsByType(type);
    return ResponseEntity.ok(Map.of(
        "message", "Available slots of type " + type + " fetched",
        "slots", slots
    ));
}
@PutMapping("/slot/{slotId}")
@PreAuthorize("hasAnyAuthority('STAFF','ADMIN')")
public ResponseEntity<Map<String, Object>> updateSlotOccupancy(
        @PathVariable Long slotId,
        @RequestBody Map<String, Object> request) {
    Boolean occupied = (Boolean) request.get("occupied");
    SlotResponseDTO updatedSlot = slotService.updateSlotOccupancy(slotId, occupied);
    Map<String, Object> res = new HashMap<>();
    res.put("slot", updatedSlot);
    return ResponseEntity.ok(res);
}
    // ✅ Feign-accessible endpoint to update slot occupancy status
    @PutMapping("/mark-occupied/{slotId}")
    public ResponseEntity<Void> markSlotOccupied(@PathVariable Long slotId) {
        System.out.println("Marking slot " + slotId + " as OCCUPIED");
        slotService.updateSlotOccupancy(slotId, true);
        System.out.println("✓ Slot " + slotId + " marked as OCCUPIED");
        return ResponseEntity.ok().build();
    }

    // Feign-accessible endpoint to mark slot as available
    @PutMapping("/mark-available/{slotId}")
    public ResponseEntity<Void> markSlotAvailable(@PathVariable Long slotId) {
        System.out.println("Marking slot " + slotId + " as AVAILABLE");
        slotService.updateSlotOccupancy(slotId, false);
        System.out.println("✓ Slot " + slotId + " marked as AVAILABLE");
        return ResponseEntity.ok().build();
    }

    // Feign-accessible endpoint to update slot occupancy via request params
    @PutMapping("/update-occupancy")
    public ResponseEntity<Void> updateSlotOccupancy(
            @RequestParam("slotId") Long slotId,
            @RequestParam("isOccupied") boolean isOccupied) {
        System.out.println("Updating slot " + slotId + " occupancy to: " + (isOccupied ? "OCCUPIED" : "AVAILABLE"));
        slotService.updateSlotOccupancy(slotId, isOccupied);
        System.out.println("✓ Slot " + slotId + " occupancy updated successfully");
        return ResponseEntity.ok().build();
    }


@GetMapping("/{slotId}")
public ResponseEntity<Map<String, Object>> getSlotById(@PathVariable Long slotId) {
    SlotResponseDTO slot = slotService.getSlotById(slotId);
    Map<String, Object> res = new HashMap<>();
    res.put("slot", slot);
    return ResponseEntity.ok(res);
}


 
}
 