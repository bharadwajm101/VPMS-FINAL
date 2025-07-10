package com.parking.reservation_service.repository;
 
import com.parking.reservation_service.entity.Reservation;
import com.parking.reservation_service.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
import java.time.LocalDateTime;

    
 
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
 
    List<Reservation> findByUserId(Long userId);
 
    List<Reservation> findBySlotIdAndStatus(Long slotId, ReservationStatus status);

    List<Reservation> findByStatusAndEndTimeBefore(ReservationStatus status, LocalDateTime endTime);
}
 