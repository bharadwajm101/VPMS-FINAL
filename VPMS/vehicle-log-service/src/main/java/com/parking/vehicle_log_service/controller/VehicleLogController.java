package com.parking.vehicle_log_service.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.parking.vehicle_log_service.dto.VehicleEntryRequest;
import com.parking.vehicle_log_service.dto.VehicleExitRequest;
import com.parking.vehicle_log_service.dto.VehicleLogResponse;
import com.parking.vehicle_log_service.service.VehicleLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vehicle-log")
@RequiredArgsConstructor
public class VehicleLogController {

    private final VehicleLogService logService;


    // 🔹 Log vehicle entry (STAFF or ADMIN)
 @PostMapping("/entry")
    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")   
    public ResponseEntity<Map<String, Object>> logEntry(@RequestBody VehicleEntryRequest request) {
        try {
            VehicleLogResponse response = logService.logVehicleEntry(request);
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Vehicle entry recorded");
            res.put("log", response);
            return ResponseEntity.ok(res);
        } catch (RuntimeException ex) {
            Map<String, Object> res = new HashMap<>();
            res.put("error", ex.getMessage());
            return ResponseEntity.badRequest().body(res);
        }
    }

    // 🔹 Log vehicle exit (STAFF or ADMIN)
    @PostMapping("/exit")
    @PreAuthorize("hasAnyAuthority('STAFF')")
    public ResponseEntity<Map<String, Object>> logExit(@RequestBody VehicleExitRequest request) {
        VehicleLogResponse response = logService.logVehicleExit(request);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Vehicle exit recorded");
        res.put("log", response);
        return ResponseEntity.ok(res);
    }

    // 🔹 Get all logs (ADMIN only)
    @GetMapping 
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF', 'CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getAllLogs() {
        List<VehicleLogResponse> logs = logService.getAllLogs();
        Map<String, Object> res = new HashMap<>();
        res.put("count", logs.size());
        res.put("logs", logs);
        return ResponseEntity.ok(res);
    }

    // 🔹 Get a specific log by ID (ADMIN and STAFF)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<VehicleLogResponse> getLogById(@PathVariable Long id) {
        return ResponseEntity.ok(logService.getLogById(id));
    }

    // ...existing code...

    // 🔹 Update a vehicle log by ID (STAFF or ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateLog(
            @PathVariable Long id,
            @RequestBody VehicleLogResponse updateRequest) {
        VehicleLogResponse updated = logService.updateLogById(id, updateRequest);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Vehicle log updated");
        res.put("log", updated);
        return ResponseEntity.ok(res);
            }

            @GetMapping("/user/{userId}")
@PreAuthorize("hasAnyAuthority('ADMIN','STAFF','CUSTOMER')")
public ResponseEntity<List<VehicleLogResponse>> getLogsByUserId(@PathVariable Long userId) {
    List<VehicleLogResponse> logs = logService.getLogsByUserId(userId);
    return ResponseEntity.ok(logs);
}

}
