package edu.ubb.licenta.pgim2289.spring.service;


public interface VerificationCodeService {
    String generateVerificationCode(Long userId, String purpose);

    Boolean checkVerificationCode(Long userId, String code, String purpose);
}
