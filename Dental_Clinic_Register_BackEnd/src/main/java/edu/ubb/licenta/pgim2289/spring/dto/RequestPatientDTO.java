package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Patient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestPatientDTO {
    private RequestUserDTO userDetails;

    private Long userId;

    @NotBlank()
    private String patientIdentifier;

    @NotNull()
    private LocalDate dateOfBirth;

    @NotNull()
    private Patient.Gender gender;

}