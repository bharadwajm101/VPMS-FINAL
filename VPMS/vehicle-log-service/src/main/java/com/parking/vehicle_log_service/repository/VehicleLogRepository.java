package com.parking.vehicle_log_service.repository;

import com.parking.vehicle_log_service.entity.VehicleLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleLogRepository extends JpaRepository<VehicleLog, Long> {

    List<VehicleLog> findByUserId(Long userId);

    List<VehicleLog> findBySlotId(Long slotId);

    List<VehicleLog> findByVehicleNumber(String vehicleNumber);
}
