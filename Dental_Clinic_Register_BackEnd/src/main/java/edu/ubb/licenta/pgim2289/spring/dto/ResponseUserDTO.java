package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Gender;
import edu.ubb.licenta.pgim2289.spring.model.Patient;
import lombok.Data;

import java.time.LocalDate;
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
    private Gender gender;
    private LocalDate LocalDate;
    private String profilePictureUrl;
    private Set<String> roles;
    private String specialisation;
    private String licenseNumber;
}
