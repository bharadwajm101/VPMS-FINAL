package com.parking.user_service.dto;
import com.parking.user_service.entity.Role;
import lombok.Data;


@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private Role role;
}
 