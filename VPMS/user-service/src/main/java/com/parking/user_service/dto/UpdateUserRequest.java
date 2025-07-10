package com.parking.user_service.dto;
import com.parking.user_service.entity.Role;
 
import lombok.*;
 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    private String name;
    private String email;
    private String password;
    private Role role; // optional — update if present
}
 