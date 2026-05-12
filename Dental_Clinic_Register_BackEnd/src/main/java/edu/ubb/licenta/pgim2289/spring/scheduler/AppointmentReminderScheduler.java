package edu.ubb.licenta.pgim2289.spring.scheduler;

import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import edu.ubb.licenta.pgim2289.spring.repository.AppointmentRepository;
import edu.ubb.licenta.pgim2289.spring.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class AppointmentReminderScheduler {
    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    public AppointmentReminderScheduler(AppointmentRepository appointmentRepository, EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedRate = 900000)
    @Transactional
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime dayStart = now.plusHours(12);
        LocalDateTime dayEnd = now.plusHours(24).plusMinutes(30);

        List<Appointment> dayReminders = appointmentRepository
                .findByStatusAndStartTimeBetweenAndReminderDaySentFalse(Appointment.AppointmentStatus.CONFIRMED, dayStart, dayEnd);

        for (Appointment a : dayReminders) {
            emailService.sendAppointmentReminder(
                    a.getPatient().getUser().getEmail(),
                    a.getPatient().getUser().getFullName(),
                    a.getStartTime(),
                    a.getDoctor().getUser().getFullName(),
                    "Tomorrow"
            );
            a.setReminderDaySent(true);
            appointmentRepository.save(a);
        }

        LocalDateTime hourStart = now;
        LocalDateTime hourEnd = now.plusMinutes(75);

        List<Appointment> hourReminders = appointmentRepository
                .findByStatusAndStartTimeBetweenAndReminderHourSentFalse(Appointment.AppointmentStatus.CONFIRMED, hourStart, hourEnd);

        for (Appointment a : hourReminders) {
            emailService.sendAppointmentReminder(
                    a.getPatient().getUser().getEmail(),
                    a.getPatient().getUser().getFullName(),
                    a.getStartTime(),
                    a.getDoctor().getUser().getFullName(),
                    "In 1 Hour"
            );
            a.setReminderHourSent(true);
            appointmentRepository.save(a);
        }
    }
}
