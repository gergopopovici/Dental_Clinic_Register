
package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.config.JwtProperties;
import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.exception.TokenAccessedException;
import edu.ubb.licenta.pgim2289.spring.exception.TokenExpiredException;
import edu.ubb.licenta.pgim2289.spring.model.PasswordResetToken;
import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.model.VerificationToken;
import edu.ubb.licenta.pgim2289.spring.repository.PasswordResetTokenJpa;
import edu.ubb.licenta.pgim2289.spring.repository.RefreshTokenJpa;
import edu.ubb.licenta.pgim2289.spring.repository.UserJpa;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationTokenJpa;
import edu.ubb.licenta.pgim2289.spring.security.JwtTokenProvider;
import edu.ubb.licenta.pgim2289.spring.security.UserDetailsImpl;
import edu.ubb.licenta.pgim2289.spring.service.EmailService;
import edu.ubb.licenta.pgim2289.spring.service.PasswordResetTokenService;
import edu.ubb.licenta.pgim2289.spring.service.PhoneNumberUtilService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserJpa userRepository;

    @Autowired
    private RefreshTokenJpa refreshTokenRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private VerificationTokenJpa verificationTokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordResetTokenService passwordResetTokenService;
    @Autowired
    private PasswordResetTokenJpa passwordResetTokenJpa;
    @Autowired
    private PhoneNumberUtilService phoneNumberUtilService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        refreshTokenRepository.deleteByUserId(userDetails.getId());
        
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(userRepository.findById(userDetails.getId()).get());
        refreshToken.setExpiryDate(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()));
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken = refreshTokenRepository.save(refreshToken);

        return ResponseEntity.ok(new JwtResponse(jwt, refreshToken.getToken(), userDetails.getId(),
                userDetails.getUsername(), userDetails.getEmail(), roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequestDTO signUpRequestDTO) {
        if (userRepository.existsByUserName(signUpRequestDTO.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }
        if (userRepository.existsByEmail(signUpRequestDTO.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }
        if (!phoneNumberUtilService.isValidPhoneNumber(signUpRequestDTO.getPhoneNumber(), "RO")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Romanian phone number!"));
        }

        User user = new User();
        user.setUserName(signUpRequestDTO.getUsername());
        user.setEmail(signUpRequestDTO.getEmail());
        user.setPassword(encoder.encode(signUpRequestDTO.getPassword()));
        user.setFirstName(signUpRequestDTO.getFirstName());
        user.setLastName(signUpRequestDTO.getLastName());
        user.setPhoneNumber(signUpRequestDTO.getPhoneNumber());

        user.setPatient(true);
        user.setDoctor(false);
        user.setAdministrator(false);
        String token = UUID.randomUUID().toString();
        User savedUser = userRepository.save(user);
        VerificationToken verificationToken = new VerificationToken(token, savedUser);
        verificationTokenRepository.save(verificationToken);
        emailService.sendVerificationEmail(savedUser.getEmail(), token);
        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please check your email to verify your account."));
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = userDetails.getId();

        refreshTokenRepository.deleteByUserId(userId);

        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        Optional<VerificationToken> verificationTokenOptional = verificationTokenRepository.findByToken(token);

        if (verificationTokenOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid verification token!"));
        }

        if(verificationTokenOptional.get().isUsed()){
            return ResponseEntity.ok(new MessageResponse("Account has already been verified!"));
        }

        VerificationToken verificationToken = verificationTokenOptional.get();

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Verification token has expired!"));
        }

        User user = verificationToken.getUser();
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: No user associated with this token!"));
        }
        user.setEnabled(true); // Enable the user's account
        userRepository.save(user);
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);

        return ResponseEntity.ok(new MessageResponse("Account verified successfully! You can now log in."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid
                                                          @RequestBody RequestPasswordResetTokenDTO passwordResetTokenDTO) {

        Optional<User> userOpt = Optional.ofNullable(userRepository.
                findByEmail(passwordResetTokenDTO.getEmail()));
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found!"));
        }

        String rawToken = UUID.randomUUID().toString();
        String hashedToken = encoder.encode(rawToken);

        User user = userOpt.get();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setUser(user);
        passwordResetToken.setTokenHash(hashedToken);
        passwordResetTokenService.savePasswordResetToken(passwordResetToken);
        String resetLink = "http://localhost:5175/reset-password?token=" + rawToken;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink, user.getUserName());
        return ResponseEntity.ok(new MessageResponse("If that email exists, a password " +
                "reset link has been sent."));
    }

    @PostMapping("/password-reset")
    public ResponseEntity<MessageResponse> passwordReset(@Valid @RequestBody
                                                         ResponsePasswordResetTokenDTO passwordResetTokenDTO) {
        if (passwordResetTokenDTO.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error:Password is too short!"));
        }
        if (!Objects.equals(passwordResetTokenDTO.getPassword(), passwordResetTokenDTO.getPasswordConfirmation())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Passwords do not match!"));
        }
        List<PasswordResetToken> tokens = passwordResetTokenJpa.findAll();
        Optional<PasswordResetToken> tokenOptional = tokens.stream()
                .filter(token -> encoder.matches(passwordResetTokenDTO.getToken(), token.getTokenHash()))
                .findFirst();
        if (tokenOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired token."));
        }
        PasswordResetToken token = tokenOptional.get();
        try {
            passwordResetTokenService.accessPasswordResetToken(token);
        } catch (TokenExpiredException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token has expired."));
        } catch (TokenAccessedException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Token has already been used."));
        }
        User user = token.getUser();
        user.setPassword(encoder.encode(passwordResetTokenDTO.getPassword()));
        userRepository.save(user);
        emailService.passwordResetConfirmationEmail(user.getEmail(),user.getUserName());
        return ResponseEntity.ok(new MessageResponse("Password reset successful!"));
    }
}
