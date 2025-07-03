package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.config.JwtProperties;
import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.exception.TokenAccessedException;
import edu.ubb.licenta.pgim2289.spring.exception.TokenExpiredException;
import edu.ubb.licenta.pgim2289.spring.model.*;
import edu.ubb.licenta.pgim2289.spring.repository.*;
import edu.ubb.licenta.pgim2289.spring.security.JwtTokenProvider;
import edu.ubb.licenta.pgim2289.spring.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserJpa userRepository;
    private final RefreshTokenJpa refreshTokenRepository;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final VerificationTokenJpa verificationTokenRepository;
    private final EmailService emailService;
    private final PasswordResetTokenService passwordResetTokenService;
    private final PasswordResetTokenJpa passwordResetTokenJpa;
    private final PhoneNumberUtilService phoneNumberUtilService;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserJpa userRepository,
                           RefreshTokenJpa refreshTokenRepository,
                           PasswordEncoder encoder,
                           JwtTokenProvider jwtTokenProvider,
                           JwtProperties jwtProperties,
                           VerificationTokenJpa verificationTokenRepository,
                           EmailService emailService,
                           PasswordResetTokenService passwordResetTokenService,
                           PasswordResetTokenJpa passwordResetTokenJpa,
                           PhoneNumberUtilService phoneNumberUtilService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.encoder = encoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
        this.passwordResetTokenService = passwordResetTokenService;
        this.passwordResetTokenJpa = passwordResetTokenJpa;
        this.phoneNumberUtilService = phoneNumberUtilService;
    }

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        refreshTokenRepository.deleteByUserId(userDetails.getId());

        String jwt = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(userRepository.findById(userDetails.getId())
                .orElseThrow());
        refreshToken.setExpiryDate(Instant.now().plusMillis(jwtProperties
                .getRefreshTokenExpirationMs()));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshTokenRepository.save(refreshToken);

        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList());

        return new JwtResponse(jwt, refreshToken.getToken(), userDetails.getId(),
                userDetails.getUsername(), userDetails.getEmail(), roles);
    }

    @Override
    public ResponseEntity<MessageResponse> registerUser(RequestUserDTO dto) {
        if (userRepository.existsByUserName(dto.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: "
                    + "Username is already taken!"));
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error:"
                    + " Email is already in use!"));
        }
        if (!phoneNumberUtilService.isValidPhoneNumber(dto.getPhoneNumber(), "RO")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: "
                    + "Invalid Romanian phone number!"));
        }

        User user = new User();
        user.setUserName(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setPatient(true);
        user.setDoctor(false);
        user.setAdministrator(false);
        User savedUser = userRepository.save(user);

        String token = UUID.randomUUID().toString();
        verificationTokenRepository.save(new VerificationToken(token, savedUser));
        emailService.sendVerificationEmail(savedUser.getEmail(), token);

        return ResponseEntity.ok(new MessageResponse("User registered"
                + " successfully! Please check your email to verify your account."));
    }

    @Override
    public ResponseEntity<MessageResponse> verifyAccount(String token) {
        Optional<VerificationToken> optionalToken = verificationTokenRepository.findByToken(token);
        if (optionalToken.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid verification token!"));
        }

        VerificationToken verificationToken = optionalToken.get();
        if (verificationToken.isUsed()) {
            return ResponseEntity.ok(new MessageResponse("Account has already been verified!"));
        }

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Verification token has expired!"));
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        return ResponseEntity.ok(new MessageResponse("Account verified successfully! You can now log in."));
    }

    @Override
    public ResponseEntity<MessageResponse> forgotPassword(RequestPasswordResetTokenDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail());
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found!"));
        }

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = encoder.encode(rawToken);
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(hashedToken);
        passwordResetTokenService.savePasswordResetToken(resetToken);

        String link = "http://localhost:5175/reset-password?token=" + rawToken;
        emailService.sendPasswordResetEmail(user.getEmail(), link, user.getUserName());

        return ResponseEntity.ok(new MessageResponse("If that email exists, a password reset link has been sent."));
    }

    @Override
    public ResponseEntity<MessageResponse> resetPassword(ResponsePasswordResetTokenDTO dto) {
        if (dto.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Password is too short!"));
        }
        if (!dto.getPassword().equals(dto.getPasswordConfirmation())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Passwords do not match!"));
        }

        Optional<PasswordResetToken> tokenOpt = passwordResetTokenJpa.findAll().stream()
                .filter(t -> encoder.matches(dto.getToken(), t.getTokenHash()))
                .findFirst();

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired token."));
        }

        PasswordResetToken token = tokenOpt.get();
        try {
            passwordResetTokenService.accessPasswordResetToken(token);
        } catch (TokenExpiredException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token has expired."));
        } catch (TokenAccessedException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token has already been used."));
        }

        User user = token.getUser();
        user.setPassword(encoder.encode(dto.getPassword()));
        userRepository.save(user);
        emailService.passwordResetConfirmationEmail(user.getEmail(), user.getUserName());

        return ResponseEntity.ok(new MessageResponse("Password reset successful!"));
    }

    @Override
    public ResponseEntity<MessageResponse> logoutUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.
                getContext().getAuthentication().getPrincipal();
        refreshTokenRepository.deleteByUserId(userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }
}
