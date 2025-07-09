package edu.ubb.licenta.pgim2289.spring.model;

import edu.ubb.licenta.pgim2289.spring.dto.ResponsePatientDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseServiceDTO;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class ResponseTreatmentPlanDTO {
    private Long id;
    private ResponsePatientDTO patient;
    private String planName;
    private LocalDate startDate;
    private LocalDate endDate;
    private TreatmentPlan.TreatmentPlanStatus status;
    private String notes;
    private Set<ResponseServiceDTO> services;
}
