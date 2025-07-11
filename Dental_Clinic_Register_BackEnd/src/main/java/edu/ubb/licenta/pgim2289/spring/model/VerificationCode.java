package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;
@Entity
@Data
@Table(name = "verification_code")
public class VerificationCode extends BaseEntity {
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name="code",nullable = false)
    private String code;
    @Column(name="expiry_date", nullable = false)
    private LocalDateTime expiryDate;
    @Column(name="used",nullable = false)
    private boolean used = false;
    @Column(name="purpose",nullable = false)
    private String purpose;
}
