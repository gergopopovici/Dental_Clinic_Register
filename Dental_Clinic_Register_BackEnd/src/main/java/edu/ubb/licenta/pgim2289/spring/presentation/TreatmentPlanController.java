package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.TreatmentPlanDTO;
import edu.ubb.licenta.pgim2289.spring.service.TreatmentPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treatment-plans")
public class TreatmentPlanController {

    private final TreatmentPlanService treatmentPlanService;

    public TreatmentPlanController(TreatmentPlanService treatmentPlanService) {
        this.treatmentPlanService = treatmentPlanService;
    }

    @GetMapping("/patient/{userId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<List<TreatmentPlanDTO>> getPlansByPatientId(@PathVariable Long userId) {
        return ResponseEntity.ok(treatmentPlanService.getPlansByPatientId(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    public ResponseEntity<TreatmentPlanDTO> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(treatmentPlanService.getPlanById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<TreatmentPlanDTO> createPlan(@RequestBody TreatmentPlanDTO dto) {
        return new ResponseEntity<>(treatmentPlanService.createPlan(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<TreatmentPlanDTO> updatePlan(@PathVariable Long id, @RequestBody TreatmentPlanDTO dto) {
        return ResponseEntity.ok(treatmentPlanService.updatePlan(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')") // Only doctors should delete plans
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        treatmentPlanService.deletePlan(id);
        return ResponseEntity.noContent().build();
    }
}