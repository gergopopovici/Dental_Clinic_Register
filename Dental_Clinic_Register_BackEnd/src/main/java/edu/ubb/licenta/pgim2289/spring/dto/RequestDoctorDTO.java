package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestDoctorDTO {
    private RequestUserDTO userDetails;

    private Long userId;

    private String specialization;

    @NotBlank()
    private String licenseNumber;
}
