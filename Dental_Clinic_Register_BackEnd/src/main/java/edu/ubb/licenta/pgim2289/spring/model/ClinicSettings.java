package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "clinic_settings")
@Data
@NoArgsConstructor
public class ClinicSettings extends BaseEntity {
    @Column(name = "default_start_time", nullable = false)
    private LocalTime defaultStartTime;

    @Column(name = "default_end_time", nullable = false)
    private LocalTime defaultEndTime;

}