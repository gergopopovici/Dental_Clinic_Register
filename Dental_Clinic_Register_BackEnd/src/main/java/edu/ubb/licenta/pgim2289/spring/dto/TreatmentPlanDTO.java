package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Data
public class TreatmentPlanDTO {
    private Long id;
    private Long patientId;
    private Long primaryServiceId;
    private String primaryServiceName;
    private Set<Long> plannedServiceIds;
    private List<String> plannedServiceNames;
    private boolean requires3DModel;
    private LocalDate startDate;
    private LocalDate endDate;
    private TreatmentPlan.TreatmentPlanStatus status;
    private String generalNotes;
    private List<PlanAppointmentDTO> appointments;
}