package com.parking.slot_service.security;
 
import com.parking.slot_service.feign.UserClient;
import com.parking.slot_service.dto.UserResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
 
import java.util.Collections;
 
@Service
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
