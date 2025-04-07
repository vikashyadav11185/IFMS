package com.nucleusteq.ifms.service;

import com.nucleusteq.ifms.dto.AuthResponse;
import com.nucleusteq.ifms.dto.LoginRequest;
import com.nucleusteq.ifms.dto.SignupRequest;
import com.nucleusteq.ifms.dto.AuthResponse;

public interface AuthService {
    AuthResponse authenticateUser(LoginRequest loginRequest);
    void registerUser(SignupRequest signupRequest);
    AuthResponse getUserProfile(String email);  // New method to fetch user profile
}
