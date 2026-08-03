package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true, exclude = {"treatmentPlan"})
@Entity
@Table(name = "panorama_images")
@Data
@NoArgsConstructor
public class PanoramaImage extends BaseEntity {
    private String url;
    private LocalDateTime uploadDate;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id")
    private TreatmentPlan treatmentPlan;
}
