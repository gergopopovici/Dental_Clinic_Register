package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.PatientDropDownDTO;
import edu.ubb.licenta.pgim2289.spring.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/dropdown")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<PatientDropDownDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatientsForDropdown());
    }
}