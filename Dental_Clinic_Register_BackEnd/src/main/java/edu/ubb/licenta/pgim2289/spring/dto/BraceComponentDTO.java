package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BraceComponentDTO {
    private Long id;
    private Long treatmentPlanId;
    private String type;
    private Double positionX;
    private Double positionY;
    private Double positionZ;
    private Double startPositionX;
    private Double startPositionY;
    private Double startPositionZ;
    private Double endPositionX;
    private Double endPositionY;
    private Double endPositionZ;
    private String colour;
}
