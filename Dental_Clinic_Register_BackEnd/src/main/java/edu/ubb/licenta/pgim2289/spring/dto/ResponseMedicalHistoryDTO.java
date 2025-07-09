package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseMedicalHistoryDTO {
    private Long id;
    private Long patientId;
    private String allergies;
    private String currentMedications;
    private String pastMedicalConditions;
    private String familyMedicalHistory;
    private String dentalHistory;
}
