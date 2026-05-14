package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;
import edu.ubb.licenta.pgim2289.spring.exception.TreatmentPlanException;
import edu.ubb.licenta.pgim2289.spring.service.BraceComponentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static edu.ubb.licenta.pgim2289.spring.utils.SecurityUtil.getCurrentUserId;

@RestController
@RequestMapping("/api/components")
public class BraceController {

    private final BraceComponentService braceComponentService;

    public BraceController(BraceComponentService braceComponentService) {
        this.braceComponentService = braceComponentService;
    }

    @GetMapping("/plan/{treatmentPlanId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<?> getComponentsByTreatmentPlanId(@PathVariable Long treatmentPlanId) {
        try {
            Long currentUserId = getCurrentUserId();

            List<BraceComponentDTO> components = braceComponentService.getBraceComponentsByTreatmentPlanId(treatmentPlanId, currentUserId);
            return ResponseEntity.ok(components);
        } catch (TreatmentPlanException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/plan/{treatmentPlanId}/sync")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> syncComponents(@PathVariable Long treatmentPlanId, @RequestBody List<BraceComponentDTO> requestList) {
        try {
            List<BraceComponentDTO> components = braceComponentService.syncBraceComponents(treatmentPlanId, requestList);
            return ResponseEntity.ok(components);
        } catch (TreatmentPlanException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}