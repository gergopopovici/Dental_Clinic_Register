package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResponsePasswordResetTokenDTO {
    @NotBlank
    private String password;
    @NotBlank
    private String passwordConfirmation;
    @NotBlank
    private String token;
}
