package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.RequestServiceDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseServiceDTO;
import edu.ubb.licenta.pgim2289.spring.service.ServiceProvidedService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceProvidedController {
    private final ServiceProvidedService serviceProvidedService;

    public ServiceProvidedController(ServiceProvidedService serviceProvidedService) {
        this.serviceProvidedService = serviceProvidedService;
    }

    @GetMapping
    public ResponseEntity<List<ResponseServiceDTO>> getAllServices() {
        return ResponseEntity.ok(serviceProvidedService.getAllServices());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public ResponseEntity<ResponseServiceDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceProvidedService.findServiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ResponseServiceDTO> createService(@Valid
                                                            @RequestBody
                                                            RequestServiceDTO requestServiceDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceProvidedService.createService(requestServiceDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<ResponseServiceDTO> updateService(@PathVariable Long id,
                                                            @Valid @RequestBody RequestServiceDTO requestServiceDTO) {
        return ResponseEntity.ok(serviceProvidedService.updateService(id, requestServiceDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Long id){
        serviceProvidedService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
