package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class DoctorScheduleDTO {
    private Long id;
    private Long doctorId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isWorking;
}
