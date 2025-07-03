package edu.ubb.licenta.pgim2289.spring.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Complete Your Registration!");
        message.setText("To confirm your account, please click the link below:\n\n"
                + "http://localhost:5175/verify?token=" + token);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String passwordResetLink, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Complete Your Password Reset!");
        message.setText("Hello " + userName + "!\n\nHere is your password reset link:\n\n" + passwordResetLink);
        mailSender.send(message);
    }

    public void passwordResetConfirmationEmail(String to, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your Password Reset Confirmation!");
        message.setText("Hello " + userName + "!\n\nYour password was successfully reset.");
        mailSender.send(message);

    }
}