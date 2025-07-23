package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestRefreshTokenDTO {
    @NotBlank()
    private String refreshToken;
}