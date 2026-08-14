package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "time_off")
@Data
@NoArgsConstructor
public class TimeOff extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    @EqualsAndHashCode.Exclude
    private Doctor doctor;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "reason_hu")
    private String reasonHu;

    @Column(name = "reason_en")
    private String reasonEn;

    @Column(name = "reason_ro")
    private String reasonRo;
}