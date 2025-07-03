package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RequestUserDTO requestUserDTO) {
        return authService.registerUser(requestUserDTO);
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logoutUser() {
        return authService.logoutUser();
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        return authService.verifyAccount(token);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody RequestPasswordResetTokenDTO passwordResetTokenDTO) {
        return authService.forgotPassword(passwordResetTokenDTO);
    }

    @PostMapping("/password-reset")
    public ResponseEntity<MessageResponse> passwordReset(
            @Valid @RequestBody ResponsePasswordResetTokenDTO passwordResetTokenDTO) {
        return authService.resetPassword(passwordResetTokenDTO);
    }
}