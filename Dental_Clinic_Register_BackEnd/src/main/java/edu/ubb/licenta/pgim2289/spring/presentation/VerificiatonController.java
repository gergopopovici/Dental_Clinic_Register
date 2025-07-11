package edu.ubb.licenta.pgim2289.spring.presentation;


import edu.ubb.licenta.pgim2289.spring.dto.RequestVerificationDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseVerificationDTO;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.service.EmailService;
import edu.ubb.licenta.pgim2289.spring.service.UserService;
import edu.ubb.licenta.pgim2289.spring.service.VerificationCodeService;
import edu.ubb.licenta.pgim2289.spring.utils.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/verification")
public class VerificiatonController {
    private final VerificationCodeService VerificationCodeService;
    private final EmailService emailService;
    private final UserService userService;


    public VerificiatonController(VerificationCodeService service, EmailService emailService, UserService userService) {
        this.VerificationCodeService = service;
        this.emailService = emailService;
        this.userService = userService;
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT','ADMIN')")
    @PostMapping("/request")
    public ResponseEntity<String> requestCode(@RequestBody RequestVerificationDTO request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Optional<User> user = userService.findById(userId);
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User with your Id was not found");
        }
        String code = VerificationCodeService.generateVerificationCode(userId, request.getPurpose());
        emailService.verificationCodeSent(code, user.get().getEmail(), user.get().getUserName());
        return ResponseEntity.ok("Verification Code sent to your email address");
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT','ADMIN')")
    public ResponseEntity<String> verifyCode(@RequestBody ResponseVerificationDTO request) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean valid = VerificationCodeService.checkVerificationCode(userId, request.getCode(), request.getPurpose());
        return valid ? ResponseEntity.ok("Code verified.") :
                ResponseEntity.badRequest().body("Invalid or expired code.");
    }


}
