package edu.ubb.licenta.pgim2289.spring.dto;

import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResponseAppointmentDTO {
    private Long id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Appointment.AppointmentStatus status;
    private String notes;
    private String resourceLink;

    private String doctorName;
    private String patientName;
    private String serviceName;

    private Long patientId;
    private Long doctorId;
    private Long serviceId;
}
