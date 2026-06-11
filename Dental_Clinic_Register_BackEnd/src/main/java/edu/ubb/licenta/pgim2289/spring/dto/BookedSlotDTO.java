package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookedSlotDTO {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
