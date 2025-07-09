package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDoctorDTO {
    private Long id;
    private RequestUserDTO user;
    private String specialization;
    private String licenseNumber;
    private List<ResponseAppointmentDTO> appointments;
}