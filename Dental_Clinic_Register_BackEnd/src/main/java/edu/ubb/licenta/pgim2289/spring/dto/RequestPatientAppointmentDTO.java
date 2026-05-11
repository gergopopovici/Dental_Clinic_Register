package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RequestPatientAppointmentDTO {
    @NotNull
    private Long doctorId;
    @NotNull
    private Long serviceId;
    @NotNull
    @FutureOrPresent
    private LocalDate requestedDate;

    @NotNull
    private Appointment.TimePreference timePreference;
}
