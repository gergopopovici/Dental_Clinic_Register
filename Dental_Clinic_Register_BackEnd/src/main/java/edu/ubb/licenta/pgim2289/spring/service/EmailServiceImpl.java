package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.model.VerificationToken;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationTokenJpa;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final VerificationTokenJpa verificationTokenRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender, VerificationTokenJpa verificationTokenRepository) {
        this.mailSender = mailSender;
        this.verificationTokenRepository = verificationTokenRepository;
    }

    @Override
    public void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        verificationTokenRepository.save(new VerificationToken(token, user));
        sendVerificationEmail(user.getEmail(), token);
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Complete Your Registration!");
        message.setText("To confirm your account, please click the link below:\n\n"
                + "http://localhost:5175/verify?token=" + token);
        mailSender.send(message);
    }

    @Override
    public void sendPasswordResetEmail(String to, String passwordResetLink, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Complete Your Password Reset!");
        message.setText("Hello " + userName + "!\n\nHere is your password reset link:\n\n" + passwordResetLink);
        mailSender.send(message);
    }

    @Override
    public void passwordResetConfirmationEmail(String to, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your Password Reset Confirmation!");
        message.setText("Hello " + userName + "!\n\nYour password was successfully reset.");
        mailSender.send(message);
    }

    @Override
    public void sendVerificationCode(String verificationCode, String to, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your Verification Code!");
        message.setText("Hello " + userName + "!\n\nYour verification code:" + verificationCode);
        mailSender.send(message);
    }

    @Override
    public void sendEmailResetEmail(String email, String to, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your Email was Successfully Reset!");
        message.setText("Hello " + userName + "!\n\nYour email was successfully "
                + "reset to your new email address:" + email + ".");
        mailSender.send(message);
    }

    @Override
    public void sendDeletionConfirmationEmail(String to, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Your Deletion Confirmation Email!");
        message.setText("Hello " + userName + "!\n\nYour deletion confirmation email! ");
        mailSender.send(message);
    }
}