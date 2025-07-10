package com.parking.user_service.controller;
 
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.parking.user_service.dto.AuthRequest;
import com.parking.user_service.dto.AuthResponse;
import com.parking.user_service.dto.RegisterRequest;
import com.parking.user_service.dto.UpdateUserRequest;
import com.parking.user_service.dto.UserProfileResponse;
import com.parking.user_service.dto.UserResponseDTO;
import com.parking.user_service.entity.Role;
import com.parking.user_service.entity.User;
import com.parking.user_service.repository.UserRepository;
import com.parking.user_service.service.AuthService;

import lombok.RequiredArgsConstructor;




 
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class AuthController {
 
    @Autowired private AuthService authService;

    @Autowired private UserRepository userRepository;
 
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User user = authService.register(request);
     
        UserProfileResponse userProfile = new UserProfileResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole()
        );
     
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful");
        response.put("user", userProfile);
     
        return ResponseEntity.ok(response);
    }
     
     
 
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyAuthority('ADMIN','CUSTOMER','STAFF')")
    public ResponseEntity<UserProfileResponse> getProfile(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        // Map User entity to UserProfileResponse DTO
        UserProfileResponse userProfile = new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping("/assign-role/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> assignRole(
        @PathVariable Long userId,
        @RequestParam Role role) {
    
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    user.setRole(role);
    userRepository.save(user);
 
    return ResponseEntity.ok(Map.of(
        "message", "Role updated successfully",
        "user", new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole())
    ));
}

// GET /api/user/all — ADMIN only
@GetMapping("/all")
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
public ResponseEntity<?> getAllUsers() {
    List<UserProfileResponse> users = authService.getAllUsers();
    return ResponseEntity.ok(Map.of("users", users));
}
 
// GET /api/user/{id} — any authenticated user
@GetMapping("/{id}")
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF', 'CUSTOMER')")
public ResponseEntity<?> getUserById(@PathVariable Long id) {
    return ResponseEntity.ok(Map.of("user", authService.getUserById(id)));
}
 
// PUT /api/user/{id} — editable by ADMIN or that user
@PutMapping("/{id}")
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF', 'CUSTOMER')")
public ResponseEntity<?> updateUser(@PathVariable Long id,
                                    @RequestBody UpdateUserRequest request,
                                    org.springframework.security.core.Authentication authentication) {
    String email = authentication.getName();
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Unauthorized"));
 
    // Allow update only if same user or admin
    if (!user.getId().equals(id) && user.getRole() != Role.ADMIN) {
        return ResponseEntity.status(403).body(Map.of("error", "Forbidden"));
    }
 

    System.out.println("User " + email + " is updating user with ID: " + id);
 
    return ResponseEntity.ok(Map.of("message", "User updated", "user", authService.updateUser(id, request)));
}
 
// DELETE /api/user/{id} — ADMIN only
@DeleteMapping("/{id}")
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    authService.deleteUser(id);
    return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
}
 
@GetMapping("/email/{email}")
public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    UserResponseDTO userResponse = new UserResponseDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPassword(),
            user.getRole()
    );
    return ResponseEntity.ok(userResponse);
}
}
 
