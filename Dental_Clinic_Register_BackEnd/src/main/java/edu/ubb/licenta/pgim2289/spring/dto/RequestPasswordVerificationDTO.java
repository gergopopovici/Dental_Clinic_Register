package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RequestPasswordVerificationDTO {
    @NotBlank
    private String verificationCode;
}
