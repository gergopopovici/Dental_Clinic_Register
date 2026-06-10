package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.ClinicSettingsDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.service.ClinicSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clinic-settings")
public class ClinicSettingsController {
    private final ClinicSettingsService clinicSettingsService;

    public ClinicSettingsController(ClinicSettingsService clinicSettingsService) {
        this.clinicSettingsService = clinicSettingsService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','PATIENT')")
    public ResponseEntity<ClinicSettingsDTO>getSettings(){
        return ResponseEntity.ok(clinicSettingsService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateSettings(@RequestBody ClinicSettingsDTO dto) {
        return clinicSettingsService.updateSettings(dto);
    }
}
