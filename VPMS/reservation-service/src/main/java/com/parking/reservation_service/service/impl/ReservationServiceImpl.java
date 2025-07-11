package com.parking.reservation_service.service.impl;
 
import com.parking.reservation_service.dto.*;
import com.parking.reservation_service.entity.*;
import com.parking.reservation_service.repository.ReservationRepository;
import com.parking.reservation_service.service.ReservationService;
import com.parking.reservation_service.feign.SlotClient;
 
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
 
    private final ReservationRepository reservationRepo;
    private final SlotClient slotClient;

    @Scheduled(fixedRate = 10000) // runs every 10 seconds
    public void completeExpiredReservations() {
        try {
            List<Reservation> expired = reservationRepo.findByStatusAndEndTimeBefore(ReservationStatus.ACTIVE, LocalDateTime.now());
            if (!expired.isEmpty()) {
                System.out.println("=== AUTO-COMPLETION TRIGGERED ===");
                System.out.println("Found " + expired.size() + " expired reservations to complete");
                
                for (Reservation r : expired) {
                    try {
                        System.out.println("Processing reservation ID: " + r.getReservationId() + " for slot: " + r.getSlotId());
                        
                        // Update reservation status to COMPLETED
                        r.setStatus(ReservationStatus.COMPLETED);
                        reservationRepo.save(r);
                        System.out.println("✓ Reservation " + r.getReservationId() + " marked as COMPLETED");
                        
                        // Mark the slot as available again
                        try {
                            slotClient.markSlotAvailable(r.getSlotId());
                            System.out.println("✓ Slot " + r.getSlotId() + " marked as AVAILABLE");
                        } catch (Exception e) {
                            System.err.println("✗ Error marking slot " + r.getSlotId() + " as available: " + e.getMessage());
                        }
                        
                    } catch (Exception e) {
                        System.err.println("✗ Error processing reservation " + r.getReservationId() + ": " + e.getMessage());
                    }
                }
                System.out.println("=== AUTO-COMPLETION FINISHED ===");
            } else {
                System.out.println("No expired reservations found at " + LocalDateTime.now());
            }
        } catch (Exception e) {
            System.err.println("✗ Error in completeExpiredReservations: " + e.getMessage());
            e.printStackTrace();
        }
    }
 
    @Override
    public ReservationResponseDTO createReservation(ReservationRequestDTO dto) {
        // Check for existing ACTIVE reservation on same slot and time
        List<Reservation> conflicts = reservationRepo.findBySlotIdAndStatus(dto.getSlotId(), ReservationStatus.ACTIVE);
        for (Reservation r : conflicts) {
            if (dto.getStartTime().isBefore(r.getEndTime()) && dto.getEndTime().isAfter(r.getStartTime())) {
                throw new RuntimeException("Slot already reserved for the selected time.");
            }
        }

        // Do NOT mark slot as occupied here. Only reservation is created.
        // slotClient.markSlotOccupied(dto.getSlotId()); // <-- REMOVE THIS LINE

        Reservation reservation = Reservation.builder()
                .userId(dto.getUserId())
                .slotId(dto.getSlotId())
                .vehicleNumber(dto.getVehicleNumber())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(ReservationStatus.ACTIVE)
                .type(dto.getType())
                .build();

        reservationRepo.save(reservation);

        return mapToDTO(reservation);
    }
    @Override
    public ReservationResponseDTO updateReservation(Long id, ReservationRequestDTO dto) {
        Reservation reservation = reservationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    
        // Only update fields that are provided (not null)
        if (dto.getStartTime() != null) {
            reservation.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            reservation.setEndTime(dto.getEndTime());
        }
        if (dto.getVehicleNumber() != null) {
            reservation.setVehicleNumber(dto.getVehicleNumber());
        }
        if (dto.getType() != null) {
            reservation.setType(dto.getType());
        }
    
        reservationRepo.save(reservation);
        return mapToDTO(reservation);
    }

    @Override
    public ReservationResponseDTO updateReservationStatus(Long id, String status) {
        Reservation reservation = reservationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        ReservationStatus newStatus = ReservationStatus.valueOf(status.toUpperCase());
        reservation.setStatus(newStatus);
        
        // If reservation is cancelled or completed, free up the slot
        if (newStatus == ReservationStatus.CANCELLED || newStatus == ReservationStatus.COMPLETED) {
            slotClient.markSlotAvailable(reservation.getSlotId());
        }
        
        reservationRepo.save(reservation);
        return mapToDTO(reservation);
    }
  
    @Override
    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepo.save(reservation);
 
        // Call slot-service to mark it as available again
        slotClient.markSlotAvailable(reservation.getSlotId());
    }
 
    @Override
    public ReservationResponseDTO getReservationById(Long id) {
        return reservationRepo.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }
 
    @Override
    public List<ReservationResponseDTO> getAllReservations() {
        return reservationRepo.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
 
    @Override
    public List<ReservationResponseDTO> getReservationsByUser(Long userId) {
        return reservationRepo.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
 
    private ReservationResponseDTO mapToDTO(Reservation reservation) {
        return new ReservationResponseDTO(
                reservation.getReservationId(),
                reservation.getUserId(),
                reservation.getSlotId(),
                reservation.getVehicleNumber(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getStatus(),
                reservation.getType()

        );
    }
}
 