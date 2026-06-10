package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.ClinicSettingsDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import org.springframework.http.ResponseEntity;

public interface ClinicSettingsService {
    ClinicSettingsDTO getSettings();

    ResponseEntity<MessageResponse> updateSettings(ClinicSettingsDTO dto);
}
