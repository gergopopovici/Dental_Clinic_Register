package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.model.VerificationToken;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationTokenJpa;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @Override
    public void sendDoctorInviteEmail(String to, String frontEnd) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Doctor Registration Invitation");
        message.setText("Hello!\n\nYou have been invited to register as a Doctor in our clinic system.\n\n"
                + "Please click the link below to set up your account:\n\n"
                + frontEnd + "\n\n"
                + "Note: This invitation link is valid for 24 hours.");
        mailSender.send(message);
    }

    @Override
    public void sendAdminInviteEmail(String to, String frontEnd) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Admin Registration Invitation");
        message.setText(("Hello!\n\nYou have been invited to register as an Admin in our clinic system.\n\n"
                + "Please click the link below to set up your account:\n\n"
                + frontEnd + "\n\n"
                + "Note: This invitation link is valid for 24 hours."));
        mailSender.send(message);
    }

    @Override
    public void sendBanningNotificationEmail(String to, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Account Suspension Notice");
        message.setText("Hello " + userName + ",\n\n"
                + "We are writing to inform you that your account in our clinic system has been suspended.\n\n"
                + "If you believe this was a mistake, please contact support.");
        mailSender.send(message);
    }

    @Override
    public void sendReactivatingNotificationEmail(String to, String userName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Account Reactivation Notice");
        message.setText("Hello " + userName + ",\n\n"
                + "Good news! Your account in our clinic system has been reactivated.\n\n"
                + "You can now log in and continue using our services."
                + "\n\nIf you have any questions, feel free to contact support.");
        mailSender.send(message);
    }

    @Override
    public void sendNewRequestEmailToDoctor(String doctorEmail, String doctorName, String patientName, LocalDate requestedDate) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(doctorEmail);
        message.setSubject("New Appointment Request");
        message.setText("Hello Dr. " + doctorName + ",\n\n"
                + "You have a new appointment request from patient " + patientName
                + " for the date: " + requestedDate + ".\n\n"
                + "Please log in to the system to review and confirm the exact time.");
        mailSender.send(message);
    }

    @Override
    public void sendConfirmationEmailToPatient(String patientEmail, String patientName, LocalDateTime exactStartTime, String doctorName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(patientEmail);
        message.setSubject("Appointment Confirmed!");
        message.setText("Hello " + patientName + ",\n\n"
                + "Great news! Your appointment has been officially confirmed.\n\n"
                + "Doctor: Dr. " + doctorName + "\n"
                + "Date & Time: " + exactStartTime + "\n\n"
                + "We look forward to seeing you!");
        mailSender.send(message);
    }

    @Override
    public void sendNewAppointmentCreatedEmailToPatient(String patientEmail, String patientName, LocalDateTime exactStartTime, String doctorName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(patientEmail);
        message.setSubject("New Appointment Scheduled");
        message.setText("Hello " + patientName + ",\n\n"
                + "A new appointment has been scheduled for you by the clinic.\n\n"
                + "Doctor: Dr. " + doctorName + "\n"
                + "Date & Time: " + exactStartTime + "\n\n"
                + "If you need to reschedule, please contact the clinic or log into your portal.");
        mailSender.send(message);
    }

    @Override
    public void sendAppointmentUpdatedEmailToPatient(String patientEmail, String patientName, LocalDateTime newStartTime, String doctorName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(patientEmail);
        message.setSubject("Appointment Rescheduled");
        message.setText("Hello " + patientName + ",\n\nYour appointment with Dr. " + doctorName + " has been rescheduled.\n\nNew Time: " + newStartTime);
        mailSender.send(message);
    }

    @Override
    public void sendPostVisitThankYouEmail(String patientEmail, String patientName, String doctorName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(patientEmail);
        message.setSubject("Thank you for your visit!");
        message.setText("Hello " + patientName + ",\n\nThank you for visiting Dr. " + doctorName + " today. We hope you had a great experience!");
        mailSender.send(message);
    }

    @Override
    public void sendAppointmentCancelledByPatientEmailToDoctor(String doctorEmail, String doctorName, String patientName, String dateInfo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(doctorEmail);
        message.setSubject("Appointment Cancelled by Patient");
        message.setText("Hello Dr. " + doctorName + ",\n\nPatient " + patientName + " has cancelled their appointment for " + dateInfo + ".");
        mailSender.send(message);
    }

    @Override
    public void sendAppointmentCancelledByDoctorEmailToPatient(String patientEmail, String patientName, String doctorName, String dateInfo, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(patientEmail);
        message.setSubject("Appointment Cancelled");
        message.setText("Hello " + patientName + ",\n\nUnfortunately, Dr. " + doctorName + " had to cancel your appointment on " + dateInfo + ".\nReason: " + reason + "\n\nPlease log in to book a new time.");
        mailSender.send(message);
    }

    @Override
    public void sendAppointmentReminder(String to, String userName, LocalDateTime startTime, String doctorName, String type) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("Appointment Reminder: " + type);
        message.setText("Hello " + userName + ",\n\nThis is a reminder that you have an appointment with Dr. "
                + doctorName + ".\nTime: " + startTime.toString().replace("T", " ")
                + "\n\nWe look forward to seeing you!");
        mailSender.send(message);
    }
}
