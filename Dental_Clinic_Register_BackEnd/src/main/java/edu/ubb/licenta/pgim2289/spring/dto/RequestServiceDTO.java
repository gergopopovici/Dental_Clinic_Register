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
    @NotBlank(message = "service.name.not.blank")
    private String name;

    private String description;

    @NotNull(message = "service.price.is.required")
    @Positive(message = "service.price.must.be.greater.than.zero")
    private BigDecimal price;

    @NotNull(message = "service.duration.is.required")
    @Positive(message = "service.duration.must.be.greater.than.zero")
    private Integer durationMinutes;
}