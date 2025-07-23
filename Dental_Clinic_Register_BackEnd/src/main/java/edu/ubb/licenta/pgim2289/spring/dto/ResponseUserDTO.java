package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Patient;
import lombok.Data;

import java.util.Set;

@Data
public class ResponseUserDTO {
    private Long id;
    private String userName;
    private String email;
    private String phoneNumber;
    private String firstName;
    private String middleName;
    private String lastName;
    private Boolean enabled;
    private Patient.Gender gender;
    private Set<String> roles;
}
