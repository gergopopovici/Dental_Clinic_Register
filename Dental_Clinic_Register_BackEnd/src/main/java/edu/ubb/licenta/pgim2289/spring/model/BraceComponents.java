package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "brace_components")
@Data
@NoArgsConstructor
public class BraceComponents extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "treatment_plan_id", nullable = false)
    private TreatmentPlan treatmentPlan;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "positionX")
    private Double positionX;

    @Column(name = "positionY")
    private Double positionY;

    @Column(name = "positionZ")
    private Double positionZ;

    @Column(name = "startPositionX")
    private Double startPositionX;

    @Column(name = "startPositionY")
    private Double startPositionY;

    @Column(name = "startPositionZ")
    private Double startPositionZ;

    @Column(name = "endPositionX")
    private Double endPositionX;

    @Column(name = "endPositionY")
    private Double endPositionY;

    @Column(name = "endPositionZ")
    private Double endPositionZ;

    @Column(name = "colour")
    private String colour;
}