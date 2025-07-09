package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestServiceDTO {
    @NotBlank()
    private String name;

    private String description;

    @NotNull()
    @Positive()
    private BigDecimal price;

    @NotNull()
    @Positive()
    private Integer durationMinutes;
}