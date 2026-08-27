package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "service_provided")
@Data
@NoArgsConstructor
public class ServiceProvided extends BaseEntity {

    @Column(name = "name_hu", unique = true, nullable = false)
    private String nameHu;

    @Column(name = "name_en", unique = true, nullable = false)
    private String nameEn;

    @Column(name = "name_ro", unique = true, nullable = false)
    private String nameRo;

    @Column(name = "description_hu", columnDefinition = "TEXT")
    private String descriptionHu;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "description_ro", columnDefinition = "TEXT")
    private String descriptionRo;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "is_patient_bookable", nullable = false)
    private Boolean isPatientBookable;
}