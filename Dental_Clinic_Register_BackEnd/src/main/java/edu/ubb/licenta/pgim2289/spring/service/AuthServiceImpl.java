package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.config.AuthenticationDependencies;
import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.model.*;
import edu.ubb.licenta.pgim2289.spring.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;
    private final ValidationService validationService;

    public AuthServiceImpl(AuthenticationDependencies deps) {
        this.authenticationManager = deps.authenticationManager;
        this.userService = deps.userService;
        this.tokenService = deps.tokenService;
        this.emailService = deps.emailService;
        this.passwordResetService = deps.passwordResetService;
        this.validationService = deps.validationService;
    }

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Delegate token operations to TokenService
        TokenResponse tokenResponse = tokenService.createTokensForUser(userDetails.getId(), authentication);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtResponse(
                tokenResponse.getAccessToken(),
                tokenResponse.getRefreshToken(),
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    @Override
    public ResponseEntity<MessageResponse> registerUser(RequestUserDTO dto) {
        ValidationResult validation = validationService.validateUserRegistration(dto);
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().body(new MessageResponse(validation.getErrorMessage()));
        }

        User savedUser = userService.createUser(dto);

        emailService.sendVerificationEmail(savedUser);

        return ResponseEntity.ok(new MessageResponse("User registered successfully! "
                + "Please check your email to verify your account."));
    }

    @Override
    public ResponseEntity<MessageResponse> verifyAccount(String token) {
        return userService.verifyUserAccount(token);
    }

    @Override
    public ResponseEntity<MessageResponse> forgotPassword(RequestPasswordResetTokenDTO dto) {
        return passwordResetService.initiateForgotPassword(dto);
    }

    @Override
    public ResponseEntity<MessageResponse> resetPassword(ResponsePasswordResetTokenDTO dto) {
        return passwordResetService.resetPassword(dto);
    }

    @Override
    public ResponseEntity<MessageResponse> logoutUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        tokenService.revokeUserTokens(userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }
}
