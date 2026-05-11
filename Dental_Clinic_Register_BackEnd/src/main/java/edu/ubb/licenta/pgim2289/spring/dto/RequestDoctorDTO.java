package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestDoctorDTO {
    private RequestUserDTO userDetails;

    private Long userId;

    private String specialization;

    @NotBlank()
    private String licenseNumber;
    @NotEmpty(message = "doctor.must.select.atleast.one.service")
    private List<Long> serviceIds;
}
