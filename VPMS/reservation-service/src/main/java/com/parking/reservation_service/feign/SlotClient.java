package com.parking.reservation_service.feign;
 
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
 
@FeignClient(name = "slot-service", path = "/api/slots")
public interface SlotClient {
 
    @PutMapping("/mark-occupied/{slotId}")
    void markSlotOccupied(@PathVariable Long slotId);
 
    @PutMapping("/mark-available/{slotId}")
    void markSlotAvailable(@PathVariable Long slotId);

    @PutMapping("/update-occupancy")
    void updateSlotOccupancy(
        @RequestParam("slotId") Long slotId,
        @RequestParam("isOccupied") boolean isOccupied
    );
}
 