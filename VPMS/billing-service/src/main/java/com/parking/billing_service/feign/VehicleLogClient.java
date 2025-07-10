package com.parking.billing_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.parking.billing_service.dto.VehicleLogResponse;
import java.util.List;

@FeignClient(name = "vehicle-log-service")
public interface VehicleLogClient {

    @GetMapping("/api/vehicle-log/{logId}")
    VehicleLogResponse getLogById(@PathVariable Long logId);

}
