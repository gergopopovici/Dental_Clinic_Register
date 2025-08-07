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
    private double positionX;
    @Column(name = "positionY")
    private double positionY;
    @Column(name = "positionZ")
    private double positionZ;
    @Column(name = "startPositionX")
    private double startPositionX;
    @Column(name = "startPositionY")
    private double startPositionY;
    @Column(name = "startPositionZ")
    private double startPositionZ;
    @Column(name = "endPositionX")
    private double endPositionX;
    @Column(name = "endPositionY")
    private double endPositionY;
    @Column(name = "endPositionZ")
    private double endPositionZ;
    @Column(name = "colour")
    private String colour;
}
