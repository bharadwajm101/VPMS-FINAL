package com.parking.slot_service.repository;
 
import com.parking.slot_service.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
 
import java.util.List;
 
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByIsOccupiedFalse();
    List<Slot> findByTypeAndIsOccupiedFalse(String type); // For available slots
}
 