package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestTreatmentPlanDTO {
    @NotNull()
    private Long patientId;

    @NotBlank()
    private String planName;

    private LocalDate startDate;
    private LocalDate endDate;

    private String notes;

    private Set<Long> serviceIds;
    private TreatmentPlan.TreatmentPlanStatus status;
}