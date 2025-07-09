package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestAppointmentDTO {
    @NotNull()
    private Long patientId;

    @NotNull()
    private Long doctorId;

    @NotNull()
    private Long serviceId;

    @NotNull()
    private LocalDateTime startTime;

    private String notes;

    private Appointment.AppointmentStatus status;
}