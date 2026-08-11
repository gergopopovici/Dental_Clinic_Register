package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.DoctorDropDownDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.security.UserDetailsImpl;
import edu.ubb.licenta.pgim2289.spring.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {
    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/by-service/{serviceId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<DoctorDropDownDTO>> getDoctorsByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(doctorService.getDoctorsByServiceId(serviceId));
    }
    @PutMapping("/me/services")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MessageResponse> updateMyServices(
            @RequestBody List<Long> serviceIds,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return doctorService.updateDoctorServices(userDetails.getId(), serviceIds);
    }
}
