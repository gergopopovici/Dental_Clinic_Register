package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;

@Data
public class AppointmentSummaryDTO {
    private Long id;
    private String notes;
    private String audioUrl;
    private String imageUrl;
    private String documentUrl;
}
