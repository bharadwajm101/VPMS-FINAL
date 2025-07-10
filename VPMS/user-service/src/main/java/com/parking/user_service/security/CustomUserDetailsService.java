package com.parking.user_service.security;
 
import com.parking.user_service.entity.User;
import com.parking.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
 
import org.springframework.stereotype.Service;
 
import java.util.Collections;
 
@Service
public class CustomUserDetailsService implements UserDetailsService {
 
    @Autowired
    private UserRepository repo;
 
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = repo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
 
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
 