package com.nucleusteq.ifms.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nucleusteq.ifms.dto.*;
import com.nucleusteq.ifms.service.AuthService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticateUser(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody SignupRequest request) {
    	System.out.println(request);
        authService.registerUser(request);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }
}