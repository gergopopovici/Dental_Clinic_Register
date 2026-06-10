package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TimeOffDTO {
    private Long id;
    private Long doctorId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}
