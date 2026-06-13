package edu.ubb.licenta.pgim2289.spring.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "Appointment_Summary")
@Data
@NoArgsConstructor
public class AppointmentSummary extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    @JsonIgnore
    private Appointment appointment;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(name = "audio_url")
    private String audioUrl;
    @Column(name = "image_url")
    private String imageUrl;
    @Column(name = "document_url")
    private String documentUrl;
}
