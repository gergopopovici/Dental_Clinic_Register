package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@EqualsAndHashCode(callSuper = true, exclude = {"plannedServices", "braceComponents", "appointments"})
@Entity
@Table(name = "Treatment_Plan")
@Data
@NoArgsConstructor
public class TreatmentPlan extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_service_id", nullable = false)
    private ServiceProvided primaryService;

    @Column(name = "requires_3d_model", nullable = false)
    private boolean requires3DModel = false;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TreatmentPlanStatus status;

    @Column(name = "general_notes", columnDefinition = "TEXT")
    private String generalNotes;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "treatment_plan_services",
            joinColumns = @JoinColumn(name = "treatment_plan_id"),
            inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<ServiceProvided> plannedServices = new HashSet<>();

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<BraceComponents> braceComponents = new HashSet<>();

    public enum TreatmentPlanStatus {
        ACTIVE, COMPLETED, SUSPENDED, CANCELLED
    }
}