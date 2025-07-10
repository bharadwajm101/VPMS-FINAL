package com.parking.reservation_service.controller;
 
import java.time.LocalDateTime;
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
import org.springframework.web.bind.annotation.RestController;

import com.parking.reservation_service.dto.ReservationRequestDTO;
import com.parking.reservation_service.dto.ReservationResponseDTO;
import com.parking.reservation_service.service.ReservationService;

import lombok.RequiredArgsConstructor;
 
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {
 
    private final ReservationService reservationService;

 
    // ✅ 1. Make a Reservation (CUSTOMER only)
    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> createReservation(@RequestBody ReservationRequestDTO request) {
        ReservationResponseDTO dto = reservationService.createReservation(request);
        return ResponseEntity.ok(Map.of(
                "message", "Reservation created successfully",
                "reservation", dto
        ));
    }
 
    // ✅ 2. Get All Reservations (ADMIN only)
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }
 
    //  3. Get Reservation by ID (ADMIN or the same USER)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER', 'STAFF')")
    public ResponseEntity<ReservationResponseDTO> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }
 
    // ✅ 4. Cancel Reservation (CUSTOMER or ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok(Map.of("message", "Reservation cancelled successfully"));
    }
 
 // ✅ 5. Update Reservation (CUSTOMER or ADMIN)
@PutMapping("/{id}")
@PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
public ResponseEntity<Map<String, Object>> updateReservation(
        @PathVariable Long id,
        @RequestBody ReservationRequestDTO request
) {
    // You need to convert ReservationRequestDTO to UpdateReservationDTO if required by your service
    // Or update your service to accept ReservationRequestDTO directly
    ReservationResponseDTO updated = reservationService.updateReservation(id, request);
    return ResponseEntity.ok(Map.of(
            "message", "Reservation updated successfully",
            "reservation", updated
    ));
}

// ✅ 6. Update Reservation Status (ADMIN only)
@PutMapping("/{id}/status")
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<Map<String, Object>> updateReservationStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
) {
    String status = request.get("status");
    ReservationResponseDTO updated = reservationService.updateReservationStatus(id, status);
    return ResponseEntity.ok(Map.of(
            "message", "Reservation status updated successfully",
            "reservation", updated
    ));
}
 
    // ✅ 6. Get Reservations by User ID (ADMIN and CUSTOMER)
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyAuthority('ADMIN','CUSTOMER')")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUser(userId));
    }

    // ✅ 7. Manual trigger for auto-completion (ADMIN only - for testing)
    @PostMapping("/trigger-completion")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerAutoCompletion() {
        try {
            reservationService.completeExpiredReservations();
            return ResponseEntity.ok(Map.of(
                "message", "Auto-completion triggered successfully",
                "timestamp", LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Error triggering auto-completion: " + e.getMessage(),
                "timestamp", LocalDateTime.now().toString()
            ));
        }
    }
}
 