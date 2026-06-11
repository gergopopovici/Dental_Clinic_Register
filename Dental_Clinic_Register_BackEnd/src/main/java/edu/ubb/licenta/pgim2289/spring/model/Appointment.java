package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "Appointment")
@Data
@NoArgsConstructor
public class Appointment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceProvided service;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppointmentStatus status = AppointmentStatus.CONFIRMED;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "resource_link", length = 500)
    private String resourceLink;

    @Column(name = "reminder_day_sent")
    private Boolean reminderDaySent = false;

    @Column(name = "reminder_hour_sent")
    private Boolean reminderHourSent = false;

    public enum AppointmentStatus {
        CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    }
}