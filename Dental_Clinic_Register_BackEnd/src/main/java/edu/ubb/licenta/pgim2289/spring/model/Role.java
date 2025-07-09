package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "role")
@EqualsAndHashCode(callSuper = true)
public class Role extends BaseEntity {
    @Column(name = "role_name", nullable = false)
    private RoleName roleName;

    public enum RoleName {
        ROLE_ADMIN,
        ROLE_DOCTOR,
        ROLE_PATIENT,
    }
}

