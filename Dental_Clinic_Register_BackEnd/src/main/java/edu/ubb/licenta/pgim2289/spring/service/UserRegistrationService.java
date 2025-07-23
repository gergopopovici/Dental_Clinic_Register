package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import org.springframework.http.ResponseEntity;

public interface UserRegistrationService {
    ResponseEntity<MessageResponse> registerUser(RequestUserDTO dto);

    ResponseEntity<MessageResponse> verifyAccount(String token);
}
