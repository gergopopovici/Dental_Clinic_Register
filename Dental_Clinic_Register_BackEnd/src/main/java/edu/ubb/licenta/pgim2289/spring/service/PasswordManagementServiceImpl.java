package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestPasswordResetTokenDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponsePasswordResetTokenDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class PasswordManagementServiceImpl implements PasswordManagementService {
    private final PasswordResetService passwordResetService;

    PasswordManagementServiceImpl(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @Override
    public ResponseEntity<MessageResponse> initiateForgotPassword(RequestPasswordResetTokenDTO dto) {
        return passwordResetService.initiateForgotPassword(dto);
    }

    @Override
    public ResponseEntity<MessageResponse> resetPassword(ResponsePasswordResetTokenDTO dto) {
        return passwordResetService.resetPassword(dto);
    }
}