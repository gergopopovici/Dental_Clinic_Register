package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DoctorUpdateAppointmentDTO {
    @NotNull
    @FutureOrPresent
    private LocalDateTime newStartTime;

    private String notes;
    private String resourceLink;
}
