package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import lombok.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "User")
@Data
@NoArgsConstructor
public class User extends BaseEntity {
    @Column(name = "UserName")
    private String userName;
    @Column(name = "Password")
    private String password;
    @Email
    @Column(name = "Email")
    private String email;
    @Column(name = "PhoneNumber")
    private Integer phoneNumber;
    @Column(name = "FirstName")
    private String firstName;
    @Column(name = "MiddleName")
    private String middleName;
    @Column(name = "LastName")
    private String lastName;
    @Column(name = "Administrator")
    private Boolean administrator;
    @Column(name = "Doctor")
    private Boolean doctor;
    @Column(name = "Patient")
    private Boolean patient;
}
