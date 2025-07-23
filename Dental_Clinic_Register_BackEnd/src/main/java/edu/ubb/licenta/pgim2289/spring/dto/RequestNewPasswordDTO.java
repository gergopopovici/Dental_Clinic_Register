package edu.ubb.licenta.pgim2289.spring.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RequestNewPasswordDTO {
    @NotBlank
    @Size(min = 6, max = 40)
    String password;
}
