package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestPasswordResetTokenDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponsePasswordResetTokenDTO;
import edu.ubb.licenta.pgim2289.spring.exception.TokenAccessedException;
import edu.ubb.licenta.pgim2289.spring.exception.TokenExpiredException;
import edu.ubb.licenta.pgim2289.spring.model.PasswordResetToken;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.PasswordResetTokenJpa;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final PasswordResetTokenService passwordResetTokenService;
    private final PasswordResetTokenJpa passwordResetTokenJpa;
    private final EmailService emailService;

    public PasswordResetServiceImpl(UserRepository userRepository, PasswordEncoder encoder,
                                    PasswordResetTokenService passwordResetTokenService,
                                    PasswordResetTokenJpa passwordResetTokenJpa,
                                    EmailService emailService) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.passwordResetTokenService = passwordResetTokenService;
        this.passwordResetTokenJpa = passwordResetTokenJpa;
        this.emailService = emailService;
    }

    @Override
    public ResponseEntity<MessageResponse> initiateForgotPassword(RequestPasswordResetTokenDTO dto) {
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
}