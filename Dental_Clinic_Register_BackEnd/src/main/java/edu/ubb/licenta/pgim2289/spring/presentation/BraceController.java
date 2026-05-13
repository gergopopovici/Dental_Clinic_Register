package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;
import edu.ubb.licenta.pgim2289.spring.exception.TreatmentPlanException;
import edu.ubb.licenta.pgim2289.spring.service.BraceComponentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/components")
public class BraceController {
    private final BraceComponentService braceComponentService;

    public BraceController(BraceComponentService braceComponentService) {
        this.braceComponentService = braceComponentService;
    }

    @GetMapping("/plan/{treatmentPlanId}")
    public ResponseEntity<?> getComponentsByTreatmentPlanId(@PathVariable Long treatmentPlanId) {
        try {
            List<BraceComponentDTO> components = braceComponentService.getBraceComponentsByTreatmentPlanId(treatmentPlanId);
            return ResponseEntity.ok(components);
        } catch (TreatmentPlanException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/plan/{treatmentPlanId}/sync")
    public ResponseEntity<?> syncComponents(@PathVariable Long treatmentPlanId, @RequestBody List<BraceComponentDTO> requestList) {
        try {
            List<BraceComponentDTO> components = braceComponentService.syncBraceComponents(treatmentPlanId, requestList);
            return ResponseEntity.ok(components);
        } catch (TreatmentPlanException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}