package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "Medical_History")
@Data
@NoArgsConstructor
public class MedicalHistory extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", unique = true, nullable = false)
    private Patient patient;

    @Column(name = "allergies")
    private String allergies;

    @Column(name = "current_medications")
    private String currentMedications;

    @Column(name = "past_medical_conditions", columnDefinition = "TEXT")
    private String pastMedicalConditions;

    @Column(name = "family_medical_history", columnDefinition = "TEXT")
    private String familyMedicalHistory;

    @Column(name = "dental_history", columnDefinition = "TEXT")
    private String dentalHistory;

}