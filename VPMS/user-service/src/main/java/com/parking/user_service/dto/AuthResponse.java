package com.parking.user_service.dto;

 
import lombok.AllArgsConstructor;
import lombok.Data;
 
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private UserProfileResponse user;
}
 