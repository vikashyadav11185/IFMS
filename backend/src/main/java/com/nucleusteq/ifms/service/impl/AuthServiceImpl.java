package com.nucleusteq.ifms.service.impl;

import com.nucleusteq.ifms.dto.AuthResponse;
import com.nucleusteq.ifms.dto.LoginRequest;
import com.nucleusteq.ifms.dto.SignupRequest;
import com.nucleusteq.ifms.model.Interviewer;
import com.nucleusteq.ifms.model.Position;
import com.nucleusteq.ifms.model.Role;
import com.nucleusteq.ifms.model.User;
import com.nucleusteq.ifms.repository.InterviewerRepository;
import com.nucleusteq.ifms.repository.UserRepository;
import com.nucleusteq.ifms.security.JwtTokenProvider;
import com.nucleusteq.ifms.service.AuthService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final InterviewerRepository interviewerRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(AuthenticationManager authenticationManager, UserRepository userRepository, 
                           InterviewerRepository interviewerRepository, JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.interviewerRepository = interviewerRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        if (authentication.isAuthenticated()) {
            String token = jwtTokenProvider.generateToken(loginRequest.getEmail());
            return new AuthResponse(token, loginRequest.getEmail(), user.getRole().toString(),user.getPosition().toString());
        }
        throw new RuntimeException("Invalid credentials");
    }

    @Transactional
    @Override
    public void registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already in use!");
        }

        User user = new User();
        user.setFullName(signupRequest.getFullName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(signupRequest.getRole() != null ? signupRequest.getRole() : Role.INTERVIEWER);
        user.setPosition(signupRequest.getPosition() != null ? signupRequest.getPosition() : Position.SOFTWARE_ENGINEER);
        
        // Save user
        User savedUser = userRepository.save(user);

        // If role is INTERVIEWER, save details in the interviewers table
        if (savedUser.getRole() == Role.INTERVIEWER) {
            Interviewer interviewer = new Interviewer();
            interviewer.setName(savedUser.getFullName());
            interviewer.setEmail(savedUser.getEmail());
            interviewer.setPosition(savedUser.getPosition()); // Default value
            interviewer.setAssignedInterviews(0);
            
            interviewerRepository.save(interviewer);
        }
    }

	@Override
	public AuthResponse getUserProfile(String email) {
		// TODO Auto-generated method stub
		return null;
	}
}
