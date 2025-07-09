package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "sequence_generator")
public class Sequence {
    @Id
    @Column(name = "sequence_name", unique = true, nullable = false)
    private String sequenceName;

    @Column(name = "next_value", nullable = false)
    private Long nextValue;

}
