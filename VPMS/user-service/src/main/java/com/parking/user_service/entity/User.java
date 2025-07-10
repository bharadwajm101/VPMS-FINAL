package com.parking.user_service.entity;

import jakarta.persistence.*;
import lombok.*;
 

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
 
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private String name;
    private String email;
    private String password;
 
    @Enumerated(EnumType.STRING)
    private Role role;
}
 