package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;


@Data
public class RequestUserDTO {
    @NotBlank
    @Size(min = 6, max = 20)
    private String username;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    @NotBlank
    private String firstName;
    private String middleName;
    @NotBlank
    private String lastName;
    @NotBlank
    private String phoneNumber;
    private Set<String> roles;
    @NotNull(message = "Date of birth cannot be empty")
    private LocalDate dateOfBirth;
    @NotNull(message = "Gender cannot be empty")
    private Patient.Gender gender;
}
