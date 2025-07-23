package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.ArrayList;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "Doctor")
@Data
@NoArgsConstructor
public class Doctor extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(name = "Specialization")
    private String specialization;

    @Column(name = "License_Number", unique = true, nullable = false)
    private String licenseNumber;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> appointments = new ArrayList<>();
}