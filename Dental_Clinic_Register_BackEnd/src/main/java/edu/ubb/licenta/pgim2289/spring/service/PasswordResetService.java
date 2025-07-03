package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestPasswordResetTokenDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponsePasswordResetTokenDTO;
import org.springframework.http.ResponseEntity;

public interface PasswordResetService {
    ResponseEntity<MessageResponse> initiateForgotPassword(RequestPasswordResetTokenDTO dto);

    ResponseEntity<MessageResponse> resetPassword(ResponsePasswordResetTokenDTO dto);
}