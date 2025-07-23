package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Patient;
import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponsePatientDTO {
    private Long id;
    private ResponseUserDTO user;
    private String patientIdentifier;
    private LocalDate dateOfBirth;
    private Patient.Gender gender;

    @Data
    public static class ResponseTreatmentPlanDTO {
        private Long id;
        private ResponsePatientDTO patient;
        private String planName;
        private LocalDate startDate;
        private LocalDate endDate;
        private TreatmentPlan.TreatmentPlanStatus status;
        private String notes;
        private Set<ResponseServiceDTO> services;
    }
}
