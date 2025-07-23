package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;

public interface EmailService {
    void sendVerificationEmail(User user);

    void sendVerificationEmail(String to, String token);

    void sendPasswordResetEmail(String to, String passwordResetLink, String userName);

    void passwordResetConfirmationEmail(String to, String userName);

    void sendVerificationCode(String verificationCode, String to, String userName);

    void sendEmailResetEmail(String email, String to, String userName);

    void sendDeletionConfirmationEmail(String to, String userName);
}
