package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RequestPatientAppointmentDTO {
    @NotNull
    private Long doctorId;

    @NotNull
    private Long serviceId;

    @NotNull
    @FutureOrPresent
    private LocalDateTime startTime;
}
