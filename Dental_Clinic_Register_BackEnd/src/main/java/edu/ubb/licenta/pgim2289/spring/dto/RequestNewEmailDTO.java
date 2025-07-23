package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RequestNewEmailDTO {
    @NotBlank
    @Email
    String email;
}
