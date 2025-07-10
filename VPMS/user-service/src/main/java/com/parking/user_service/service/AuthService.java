package com.parking.user_service.service;
 
import com.parking.user_service.dto.*;
import com.parking.user_service.entity.Role;
import com.parking.user_service.entity.User;
import com.parking.user_service.repository.UserRepository;
import com.parking.user_service.security.JwtUtil;
import com.parking.user_service.security.CustomUserDetailsService;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;




 
@Service
public class AuthService {
 
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authManager;
    @Autowired private CustomUserDetailsService userDetailsService;


 
    public User register(RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered.");
        }
     
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
     
        // Forcefully assign CUSTOMER only
        user.setRole(Role.CUSTOMER);
     
        return userRepo.save(user);
    }
     
 
    public AuthResponse login(AuthRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
     
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        User user = userRepo.findByEmail(request.getEmail()).get();
     
        UserProfileResponse userProfile = new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
     

        System.out.println("User " + user.getEmail() + " logged in successfully.");
        
        return new AuthResponse(token, user.getRole().name(), userProfile);
        
    }

    // Get All Users (ADMIN only)
public List<UserProfileResponse> getAllUsers() {
    return userRepo.findAll().stream()
            .map(user -> new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole()))
            .collect(Collectors.toList());
}
 
// Get User by ID
public UserProfileResponse getUserById(Long id) {
    User user = userRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    return new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
}
 
// Update user by ID
public UserProfileResponse updateUser(Long id, UpdateUserRequest request) {
    User user = userRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
 
    if (request.getName() != null) user.setName(request.getName());
    if (request.getEmail() != null) user.setEmail(request.getEmail());
    if (request.getPassword() != null && !request.getPassword().isBlank()) {
        user.setPassword(passwordEncoder.encode(request.getPassword()));
    }
    if (request.getRole() != null) user.setRole(request.getRole());

 
    userRepo.save(user);
    return new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
}
 
// Delete User by ID (ADMIN only)
public void deleteUser(Long id) {
    if (!userRepo.existsById(id)) throw new RuntimeException("User not found");
    userRepo.deleteById(id);
}
 
     
}