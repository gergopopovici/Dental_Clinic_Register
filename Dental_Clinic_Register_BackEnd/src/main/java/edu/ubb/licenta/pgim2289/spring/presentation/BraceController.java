package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;
import edu.ubb.licenta.pgim2289.spring.exception.BraceComponentException;
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
    public ResponseEntity<?> getComponentsByTreatmentPlanId(@PathVariable Integer treatmentPlanId) {
        try {
            List<BraceComponentDTO> components = braceComponentService.getBraceComponentsByTreatmentPlanId(treatmentPlanId);
            return ResponseEntity.ok(components);
        } catch (TreatmentPlanException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/plan/{treatmentPlanId}")
    public ResponseEntity<?> addComponent(@PathVariable Integer treatmentPlanId, @RequestBody BraceComponentDTO request) {
        try {
            BraceComponentDTO component = braceComponentService.addBraceComponent(treatmentPlanId, request);
            return ResponseEntity.ok(component);
        } catch (TreatmentPlanException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{componentId}")
    public ResponseEntity<?> deleteComponent(@PathVariable Integer componentId) {
        try {
            braceComponentService.deleteBraceComponent(componentId);
            return ResponseEntity.noContent().build();
        } catch (BraceComponentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/delete-by-coordinates")
    public ResponseEntity<Void> deleteComponentByCoordinates(
            @RequestParam Double positionX,
            @RequestParam Double positionY,
            @RequestParam Double positionZ) {
        try {
            braceComponentService.deleteBraceComponentByCoordinates(positionX, positionY, positionZ);
            return ResponseEntity.noContent().build();
        } catch (BraceComponentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/delete-rubberband-by-coordinates")
    public ResponseEntity<Void> deleteRubberBandByCoordinates(
            @RequestParam Double startPositionX,
            @RequestParam Double startPositionY,
            @RequestParam Double startPositionZ,
            @RequestParam Double endPositionX,
            @RequestParam Double endPositionY,
            @RequestParam Double endPositionZ) {
        try {
            braceComponentService.deleteRubberBandByCoordinates(
                    startPositionX, startPositionY, startPositionZ,
                    endPositionX, endPositionY, endPositionZ);
            return ResponseEntity.noContent().build();
        } catch (BraceComponentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }


}
