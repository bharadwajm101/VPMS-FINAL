package com.parking.vehicle_log_service.dto;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String email;
    private String password;
    private String role;
}