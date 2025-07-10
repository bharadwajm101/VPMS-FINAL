package com.parking.vehicle_log_service.security;

import com.parking.vehicle_log_service.dto.UserResponseDTO;
import com.parking.vehicle_log_service.feign.UserClient;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserClient userClient;
 
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserResponseDTO user = userClient.getUserByEmail(email);
        if (user == null) throw new UsernameNotFoundException("User not found");
 
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}
