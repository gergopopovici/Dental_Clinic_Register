package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseServiceDTO {
    private Long id;
    private String nameHu;
    private String nameEn;
    private String nameRo;
    private String descriptionHu;
    private String descriptionEn;
    private String descriptionRo;
    private BigDecimal price;
    private Integer durationMinutes;
}