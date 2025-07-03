package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);

    ResponseEntity<MessageResponse> registerUser(RequestUserDTO requestUserDTO);

    ResponseEntity<MessageResponse> verifyAccount(String token);

    ResponseEntity<MessageResponse> forgotPassword(RequestPasswordResetTokenDTO dto);

    ResponseEntity<MessageResponse> resetPassword(ResponsePasswordResetTokenDTO dto);

    ResponseEntity<MessageResponse> logoutUser();
}
