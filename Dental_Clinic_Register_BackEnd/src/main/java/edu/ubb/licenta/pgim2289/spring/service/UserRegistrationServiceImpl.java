package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ValidationResult;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class UserRegistrationServiceImpl implements UserRegistrationService {
    private final ValidationService validationService;
    private final UserService userService;
    private final PatientService patientService;
    private final EmailService emailService;

    UserRegistrationServiceImpl(ValidationService validationService,
                                UserService userService,
                                PatientService patientService,
                                EmailService emailService) {
        this.validationService = validationService;
        this.userService = userService;
        this.patientService = patientService;
        this.emailService = emailService;
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

        return ResponseEntity.ok(new MessageResponse("User registered"
                + " successfully! Please check your email to verify your account."));
    }

    @Override
    public ResponseEntity<MessageResponse> verifyAccount(String token) {
        return userService.verifyUserAccount(token);
    }
}