package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PanoramaImageDTO {
    private Long id;
    private String url;
    private LocalDateTime uploadDate;
}
