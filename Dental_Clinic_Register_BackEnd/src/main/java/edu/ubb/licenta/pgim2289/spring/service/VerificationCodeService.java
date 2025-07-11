package edu.ubb.licenta.pgim2289.spring.service;


public interface VerificationCodeService {
    public String generateVerificationCode(Long userId, String purpose);

    public Boolean checkVerificationCode(Long userId, String code, String purpose);
}
