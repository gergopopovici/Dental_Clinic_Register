package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PlanAppointmentDTO {
    private Long id;
    private LocalDateTime startTime;
    private String serviceName;
    private String status;
    private AppointmentSummaryDTO summary;
}
