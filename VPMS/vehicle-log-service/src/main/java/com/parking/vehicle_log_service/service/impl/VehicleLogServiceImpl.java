package com.parking.vehicle_log_service.service.impl;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.parking.vehicle_log_service.dto.VehicleEntryRequest;
import com.parking.vehicle_log_service.dto.VehicleExitRequest;
import com.parking.vehicle_log_service.dto.VehicleLogResponse;
import com.parking.vehicle_log_service.entity.VehicleLog;
import com.parking.vehicle_log_service.feign.SlotServiceClient;
import com.parking.vehicle_log_service.repository.VehicleLogRepository;
import com.parking.vehicle_log_service.service.VehicleLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleLogServiceImpl implements VehicleLogService {

    private final VehicleLogRepository logRepo;
    private final SlotServiceClient slotServiceClient;
    @Value("${slot.occupancy.field:occupied}")
    private String occupancyField;

  @Override
public VehicleLogResponse logVehicleEntry(VehicleEntryRequest request) {
    Map<String, Object> slotDetails = slotServiceClient.getSlotById(request.getSlotId());
    Map<String, Object> slot = (Map<String, Object>) slotDetails.get("slot");
    String slotType = slot != null ? (String) slot.getOrDefault("type", "UNKNOWN") : "UNKNOWN";
    Boolean isOccupied = slot != null ? (Boolean) slot.getOrDefault("occupied", false) : false;

    if (Boolean.TRUE.equals(isOccupied)) {
        throw new RuntimeException("Slot is already occupied");
    }

    VehicleLog log = new VehicleLog();
    log.setVehicleNumber(request.getVehicleNumber());
    log.setUserId(request.getUserId());
    log.setSlotId(request.getSlotId());
    log.setEntryTime(LocalDateTime.now());

    logRepo.save(log);
    // Update slot occupancy to true
    slotServiceClient.updatedSlot(
        request.getSlotId(),
        Map.of(occupancyField, true)
    );
    VehicleLogResponse response = mapToResponse(log, slotType);
    return response;
}
@Override
public VehicleLogResponse logVehicleExit(VehicleExitRequest request) {
    VehicleLog log = logRepo.findById(request.getLogId())
            .orElseThrow(() -> new RuntimeException("Log not found"));

    if (log.getExitTime() != null) {
        throw new RuntimeException("Exit already recorded for this log");
    }

    log.setExitTime(LocalDateTime.now());
    Duration duration = Duration.between(log.getEntryTime(), log.getExitTime());
    long durationMinutes = duration.toMinutes(); // Calculate duration in minutes
    log.setDurationMinutes(durationMinutes); // Save duration in minutes to the database
    logRepo.save(log);

    // Update slot occupancy to false (slot is now available)
    slotServiceClient.updatedSlot(
        log.getSlotId(),
        Map.of(occupancyField, false)
    );

    // Fetch slot type for response (extract from nested "slot" map)
    Map<String, Object> slotDetails = slotServiceClient.getSlotById(log.getSlotId());
    Map<String, Object> slot = (Map<String, Object>) slotDetails.get("slot");
    String slotType = slot != null ? (String) slot.getOrDefault("type", "UNKNOWN") : "UNKNOWN";

    return new VehicleLogResponse(
        log.getLogId(),
        log.getVehicleNumber(),
        log.getEntryTime(),
        log.getExitTime(),
        String.format("%02d:%02d:%02d",
            durationMinutes / 60,
            durationMinutes % 60,
            0), // Format duration for response
        log.getUserId(),
        log.getSlotId(),
        slotType
    );
}

@Override
public List<VehicleLogResponse> getAllLogs() {
    return logRepo.findAll()
            .stream()
            .map(log -> {
                Map<String, Object> slotDetails = slotServiceClient.getSlotById(log.getSlotId());
                Map<String, Object> slot = (Map<String, Object>) slotDetails.get("slot");
                String slotType = slot != null ? (String) slot.getOrDefault("type", "UNKNOWN") : "UNKNOWN";
                return mapToResponse(log, slotType);
            })
            .collect(Collectors.toList());
}

@Override
public VehicleLogResponse getLogById(Long id) {
    VehicleLog log = logRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Log not found"));
    Map<String, Object> slotDetails = slotServiceClient.getSlotById(log.getSlotId());
    Map<String, Object> slot = (Map<String, Object>) slotDetails.get("slot");
    String slotType = slot != null ? (String) slot.getOrDefault("type", "UNKNOWN") : "UNKNOWN";
    return mapToResponse(log, slotType);
}

    private VehicleLogResponse mapToResponse(VehicleLog log, String slotType) {
        String formattedDuration = null;
        if (log.getEntryTime() != null && log.getExitTime() != null) {
            Duration duration = Duration.between(log.getEntryTime(), log.getExitTime());
            long seconds = duration.getSeconds();
            formattedDuration = String.format("%02d:%02d:%02d",
                    seconds / 3600,
                    (seconds % 3600) / 60,
                    seconds % 60);
        }
        return new VehicleLogResponse(
                log.getLogId(),
                log.getVehicleNumber(),
                log.getEntryTime(),
                log.getExitTime(),
                formattedDuration,
                log.getUserId(),
                log.getSlotId(),
                slotType
        );
    }

    // Helper to fetch slot type safely
    private String fetchSlotType(Long slotId) {
        try {
            Map<String, Object> slotDetails = slotServiceClient.getSlotById(slotId);
            return (String) slotDetails.getOrDefault("type", "UNKNOWN");
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }

    @Override
public VehicleLogResponse updateLogById(Long id, VehicleLogResponse updateRequest) {
    VehicleLog log = logRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Log not found"));

    if (updateRequest.getVehicleNumber() != null) {
        log.setVehicleNumber(updateRequest.getVehicleNumber());
    }
    if (updateRequest.getSlotId() != null && !updateRequest.getSlotId().equals(log.getSlotId())) {
        // Free old slot
        slotServiceClient.updatedSlot(log.getSlotId(), Map.of(occupancyField, false));
        // Occupy new slot
        slotServiceClient.updatedSlot(updateRequest.getSlotId(), Map.of(occupancyField, true));
        log.setSlotId(updateRequest.getSlotId());
    }
   

    logRepo.save(log);
    Map<String, Object> slotDetails = slotServiceClient.getSlotById(log.getSlotId());
    Map<String, Object> slot = (Map<String, Object>) slotDetails.get("slot");
    String slotType = slot != null ? (String) slot.getOrDefault("type", "UNKNOWN") : "UNKNOWN";
    return mapToResponse(log, slotType);
}



@Override
public List<VehicleLogResponse> getLogsByUserId(Long userId) {
    return logRepo.findByUserId(userId)
            .stream()
            .map(log -> {
                Map<String, Object> slotDetails = slotServiceClient.getSlotById(log.getSlotId());
                Map<String, Object> slot = (Map<String, Object>) slotDetails.get("slot");
                String slotType = slot != null ? (String) slot.getOrDefault("type", "UNKNOWN") : "UNKNOWN";
                return mapToResponse(log, slotType);
            })
            .collect(Collectors.toList());
}


}
