
package edu.ubb.licenta.pgim2289.spring.config;

import edu.ubb.licenta.pgim2289.spring.service.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationDependencies {
    public final AuthenticationManager authenticationManager;
    public final UserService userService;
    public final TokenService tokenService;
    public final EmailService emailService;
    public final PasswordResetService passwordResetService;
    public final ValidationService validationService;
    public final PatientService patientService;

    public AuthenticationDependencies(
            AuthenticationManager authenticationManager,
            UserService userService,
            TokenService tokenService,
            EmailService emailService,
            PasswordResetService passwordResetService,
            ValidationService validationService,
            PatientService patientService
    ) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.passwordResetService = passwordResetService;
        this.validationService = validationService;
        this.patientService = patientService;
    }
}