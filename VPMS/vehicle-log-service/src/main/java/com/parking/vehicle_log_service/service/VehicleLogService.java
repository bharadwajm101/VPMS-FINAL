package com.parking.vehicle_log_service.service;

import java.util.List;

import com.parking.vehicle_log_service.dto.VehicleEntryRequest;
import com.parking.vehicle_log_service.dto.VehicleExitRequest;
import com.parking.vehicle_log_service.dto.VehicleLogResponse;

public interface VehicleLogService {

    VehicleLogResponse logVehicleEntry(VehicleEntryRequest request);

    VehicleLogResponse logVehicleExit(VehicleExitRequest request);

    List<VehicleLogResponse> getAllLogs();

    VehicleLogResponse getLogById(Long id);

    VehicleLogResponse updateLogById(Long id, VehicleLogResponse updateRequest);
  
    List<VehicleLogResponse> getLogsByUserId(Long userId);

}
