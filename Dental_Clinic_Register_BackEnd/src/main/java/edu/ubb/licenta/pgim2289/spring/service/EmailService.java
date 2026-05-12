package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface EmailService {
    void sendVerificationEmail(User user);

    void sendVerificationEmail(String to, String token);

    void sendPasswordResetEmail(String to, String passwordResetLink, String userName);

    void passwordResetConfirmationEmail(String to, String userName);

    void sendVerificationCode(String verificationCode, String to, String userName);

    void sendEmailResetEmail(String email, String to, String userName);

    void sendDeletionConfirmationEmail(String to, String userName);

    void sendDoctorInviteEmail(String to, String frontEnd);

    void sendAdminInviteEmail(String to, String frontEnd);

    void sendBanningNotificationEmail(String to, String userName);

    void sendReactivatingNotificationEmail(String to, String userName);

    void sendNewRequestEmailToDoctor(String doctorEmail, String doctorName, String patientName, LocalDate requestedDate);

    void sendConfirmationEmailToPatient(String patientEmail, String patientName, LocalDateTime exactStartTime, String doctorName);

    void sendNewAppointmentCreatedEmailToPatient(String patientEmail, String patientName, LocalDateTime exactStartTime, String doctorName);

    void sendAppointmentUpdatedEmailToPatient(String patientEmail, String patientName, LocalDateTime newStartTime, String doctorName);

    void sendPostVisitThankYouEmail(String patientEmail, String patientName, String doctorName);

    void sendAppointmentCancelledByPatientEmailToDoctor(String doctorEmail, String doctorName, String patientName, String dateInfo);

    void sendAppointmentCancelledByDoctorEmailToPatient(String patientEmail, String patientName, String doctorName, String dateInfo, String reason);

    public void sendAppointmentReminder(String to, String userName, LocalDateTime startTime, String doctorName, String type);

    }
