package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "Appointments")
@Data
@NoArgsConstructor
public class Appointments extends BaseEntity {

    @Column(name = "Description")
    private String description;

    @Column(name = "Date")
    private LocalDate date;

    @Column(name = "Hour")
    private LocalTime hour;
    @ManyToOne
    @JoinColumn(name = "User_id", nullable = false)
    private User user;
}
