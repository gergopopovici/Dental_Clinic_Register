package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class TreatmentPlanDTO {
    private Long id;
    private Long patientId;
    private String planName;
    private LocalDate startDate;
    private LocalDate endDate;
    private TreatmentPlan.TreatmentPlanStatus status;
    private String notes;
    private Set<Long> serviceIds;
}