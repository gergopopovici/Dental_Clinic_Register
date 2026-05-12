package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ResponseAppointmentDTO {
    private Long id;

    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;

    private Long serviceId;
    private String serviceName;
    private Integer serviceDurationMinutes;
    private Integer price;

    private LocalDate requestedDate;
    private Appointment.TimePreference timePreference;
    private Appointment.AppointmentStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String notes;
    private String resourceLink;
}
