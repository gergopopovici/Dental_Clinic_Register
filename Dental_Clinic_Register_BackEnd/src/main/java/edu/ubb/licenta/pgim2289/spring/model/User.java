package edu.ubb.licenta.pgim2289.spring.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

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
    private String phoneNumber;
    @Column(name = "FirstName")
    private String firstName;
    @Column(name = "MiddleName")
    private String middleName;
    @Column(name = "LastName")
    private String lastName;
    @Column(name = "Administrator")
    private Boolean administrator = false;
    @Column(name = "Doctor")
    private Boolean doctor = false;
    @Column(name = "Patient")
    private Boolean patient = true;
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = false;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointments> appointments = new ArrayList<>();

}
