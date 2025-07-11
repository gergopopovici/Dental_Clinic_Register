package edu.ubb.licenta.pgim2289.spring.dto;

import lombok.Data;

@Data
public class RequestPasswordVerificationDTO {
    private String verificationCode;
    private String purpose;
}
