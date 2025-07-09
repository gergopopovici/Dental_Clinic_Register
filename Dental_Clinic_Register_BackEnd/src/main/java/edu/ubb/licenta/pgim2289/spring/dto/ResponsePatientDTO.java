package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Patient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponsePatientDTO {
    private Long id;
    private ResponseUserDTO user;
    private String patientIdentifier;
    private LocalDate dateOfBirth;
    private Patient.Gender gender;
}
