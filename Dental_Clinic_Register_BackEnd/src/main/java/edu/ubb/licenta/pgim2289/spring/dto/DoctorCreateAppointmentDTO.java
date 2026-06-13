package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DoctorCreateAppointmentDTO {
    @NotNull
    private Long patientId;

    @NotNull
    private Long serviceId;

    @NotNull
    @FutureOrPresent
    private LocalDateTime startTime;

    private String notes;
    private String resourceLink;
    private Long treatmentPlanId;

}
