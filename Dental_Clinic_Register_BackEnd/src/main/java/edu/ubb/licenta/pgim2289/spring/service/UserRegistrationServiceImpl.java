package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestDoctorDTO;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ValidationResult;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.model.VerificationToken;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationTokenJpa;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

@Service
public class UserRegistrationServiceImpl implements UserRegistrationService {
    private final ValidationService validationService;
    private final UserService userService;
    private final PatientService patientService;
    private final EmailService emailService;
    private final DoctorService doctorService;
    private final UserRepository userRepository;
    private final VerificationTokenJpa verificationTokenRepo;

    UserRegistrationServiceImpl(ValidationService validationService,
                                UserService userService,
                                PatientService patientService,
                                EmailService emailService, DoctorService doctorService, UserRepository userRepository, VerificationTokenJpa verificationTokenRepo) {
        this.validationService = validationService;
        this.userService = userService;
        this.patientService = patientService;
        this.emailService = emailService;
        this.doctorService = doctorService;
        this.userRepository = userRepository;
        this.verificationTokenRepo = verificationTokenRepo;
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
    public ResponseEntity<MessageResponse> registerDoctor(RequestDoctorDTO requestDoctorDTO) {
        ValidationResult validation = validationService.validateUserRegistration(requestDoctorDTO.getUserDetails());
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().body(new MessageResponse(validation
                    .getErrorMessage()));
        }
        requestDoctorDTO.getUserDetails().setRoles(Set.of("ROLE_DOCTOR"));
        User savedUser = userService.createUser(requestDoctorDTO.getUserDetails());
        doctorService.createDoctor(savedUser, requestDoctorDTO);
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
    public ResponseEntity<MessageResponse> resendActivationEmail(String email) {
        if (email != null) {
            email = email.replace("\"", "").trim();
        }
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("error.email.required"));
        }
        User user = userRepository.findByEmail(email);
        if (user != null) {
            if (!user.getEnabled() && user.getAccountNonLocked()) {
                VerificationToken verificationToken = user.getVerificationToken();
                verificationToken.setToken(UUID.randomUUID().toString());
                verificationToken.setUsed(false);
                verificationToken.setExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
                verificationTokenRepo.save(verificationToken);
                emailService.sendRegistrationConfirmationEmail(user.getEmail(), verificationToken.getToken(), user.getUserName());
            }
        }
        return ResponseEntity.ok(new MessageResponse("success.activation.resent"));
    }

    @Override
    public ResponseEntity<MessageResponse> verifyAccount(String token) {
        return userService.verifyUserAccount(token);
    }
}