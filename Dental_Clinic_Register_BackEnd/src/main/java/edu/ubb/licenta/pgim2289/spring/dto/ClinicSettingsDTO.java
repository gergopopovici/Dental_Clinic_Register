package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class ClinicSettingsDTO {
    private Long id;
    private LocalTime defaultStartTime;
    private LocalTime defaultEndTime;
}
