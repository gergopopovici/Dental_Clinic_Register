package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "doctor_schedule")
@Data
@NoArgsConstructor
public class DoctorSchedule extends BaseEntity{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id",nullable = false)
    @EqualsAndHashCode.Exclude
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time",nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time",nullable = false)
    private LocalTime endTime;

    @Column(name = "is_working",nullable = false)
    private Boolean isWorking = true;
}
