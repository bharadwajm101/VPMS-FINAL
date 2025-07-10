package com.parking.vehicle_log_service.feign;
 

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PathVariable;
import com.parking.vehicle_log_service.dto.UserResponseDTO;


 
@FeignClient(name = "user-service")
public interface UserClient {


    @GetMapping("/api/user/email/{email}")
    UserResponseDTO getUserByEmail(@PathVariable("email") String email);
}
 