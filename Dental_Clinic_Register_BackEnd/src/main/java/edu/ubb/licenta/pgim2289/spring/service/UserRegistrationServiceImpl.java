package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ValidationResult;
import edu.ubb.licenta.pgim2289.spring.model.User;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserRegistrationServiceImpl implements UserRegistrationService {
    private final ValidationService validationService;
    private final UserService userService;
    private final PatientService patientService;
    private final EmailService emailService;
    private final DoctorService doctorService;

    UserRegistrationServiceImpl(ValidationService validationService,
                                UserService userService,
                                PatientService patientService,
                                EmailService emailService, DoctorService doctorService) {
        this.validationService = validationService;
        this.userService = userService;
        this.patientService = patientService;
        this.emailService = emailService;
        this.doctorService = doctorService;
    }

    @Override
    public ResponseEntity<MessageResponse> registerUser(RequestUserDTO dto) {
        ValidationResult validation = validationService
                .validateUserRegistration(dto);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().body(new MessageResponse(validation
                    .getErrorMessage()));
        }

        User savedUser = userService.createUser(dto);
        patientService.createPatient(dto);
        emailService.sendVerificationEmail(savedUser);

        return ResponseEntity.ok(new MessageResponse("accountRegisteredSuccessfully"));
    }

    @Transactional
    @Override
    public ResponseEntity<MessageResponse> registerDoctor(RequestUserDTO dto) {
        ValidationResult validation = validationService.validateUserRegistration(dto);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().body(new MessageResponse(validation
                    .getErrorMessage()));
        }
        dto.setRoles(Set.of("ROLE_DOCTOR"));
        User savedUser = userService.createUser(dto);
        doctorService.createDoctor(savedUser, dto);
        return ResponseEntity.ok(new MessageResponse("success.doctor.registered"));
    }

    @Override
    public ResponseEntity<MessageResponse> registerAdmin(RequestUserDTO dto) {
        ValidationResult validation = validationService.validateUserRegistration(dto);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().body(new MessageResponse(validation.getErrorMessage()));
        }
        dto.setRoles(Set.of("ROLE_ADMIN"));
        userService.createAdminUser(dto);
        return ResponseEntity.ok(new MessageResponse("success.admin.registered"));
    }

    @Override
    public ResponseEntity<MessageResponse> verifyAccount(String token) {
        return userService.verifyUserAccount(token);
    }
}