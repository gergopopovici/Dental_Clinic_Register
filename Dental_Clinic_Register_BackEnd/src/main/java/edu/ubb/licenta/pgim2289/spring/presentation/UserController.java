package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.model.Patient;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.service.EmailService;
import edu.ubb.licenta.pgim2289.spring.service.PatientService;
import edu.ubb.licenta.pgim2289.spring.service.UserService;
import edu.ubb.licenta.pgim2289.spring.service.VerificationCodeService;
import edu.ubb.licenta.pgim2289.spring.utils.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final VerificationCodeService verificationCodeService;
    private final EmailService emailService;
    private final PatientService patientService;

    public UserController(UserService userService, VerificationCodeService verificationCodeService,
                          EmailService emailService, PatientService patientService) {
        this.userService = userService;
        this.verificationCodeService = verificationCodeService;
        this.emailService = emailService;
        this.patientService = patientService;
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT','ADMIN')")
    @PostMapping("/request-password-change")
    public ResponseEntity<MessageResponse> requestPasswordChange() {
        Long userId = SecurityUtil.getCurrentUserId();
        Optional<User> userOptional = userService.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        User user = userOptional.get();

        String verificationCode = verificationCodeService.generateVerificationCode(userId, "password_change_request");
        emailService.sendVerificationCode(verificationCode,
                user.getEmail(), user.getUserName());

        return ResponseEntity.ok(new MessageResponse("A verification code has been sent to "
                + "your registered email address to change your password."));
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT','ADMIN')")
    @PostMapping("/verify-password-change-code")
    public ResponseEntity<MessageResponse> verifyPasswordChangeCode(@RequestBody
                                                                    RequestPasswordVerificationDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();

        if (!verificationCodeService.checkVerificationCode(userId,
                request.getVerificationCode(),
                "password_change_request")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired "
                    + "verification code!"));
        }
        return ResponseEntity.ok(new MessageResponse("Verification code confirmed."
                + " You can now set your new password."));
    }

    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT','ADMIN')")
    @PutMapping("/update-password")
    public ResponseEntity<MessageResponse> updatePassword(@RequestBody RequestNewPasswordDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        emailService.passwordResetConfirmationEmail(userService.findById(userId).get().getEmail(),
                userService.findById(userId).get().getUserName());
        return userService.updatePassword(userId, request.getPassword());
    }

    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @PostMapping("/request-email-change")
    public ResponseEntity<MessageResponse> requestEmailChange() {
        Long userId = SecurityUtil.getCurrentUserId();
        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        User user = userOptional.get();
        String verificationCode = verificationCodeService.generateVerificationCode(userId,
                "email_change_request");
        emailService.sendVerificationCode(verificationCode, user.getEmail(), user.getUserName());
        return ResponseEntity.ok(new MessageResponse("A verification code has been sent to "
                + "your registered email address to change your password."));
    }

    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @PostMapping("/verify-email-change-code")
    public ResponseEntity<MessageResponse> verifyEmailChangeCode(@RequestBody RequestEmailVerificationDTO
                                                                         request) {
        Long userId = SecurityUtil.getCurrentUserId();
        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User "
                    + "not found!"));
        }
        if (!verificationCodeService.checkVerificationCode(userId,
                request.getVerificationCode(), "email_change_request")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired "
                    + "verification code!"));
        }
        return ResponseEntity.ok(new MessageResponse("Verification code confirmed. You can now"
                + " reset your email address."));
    }

    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @PostMapping("/update-email")
    public ResponseEntity<MessageResponse> updateEmail(@RequestBody
                                                       RequestNewEmailDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        emailService.sendEmailResetEmail(request.getEmail(),
                userOptional.get().getEmail(), userOptional.get().getUserName());
        return userService.updateEmail(userId, request.getEmail());
    }

    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @DeleteMapping("/delete")
    public ResponseEntity<MessageResponse> delete() {
        Long userId = SecurityUtil.getCurrentUserId();
        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        emailService.sendDeletionConfirmationEmail(userOptional.get().getEmail(), userOptional.get().getUserName());
        return userService.deleteUser(userId);
    }

    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @PutMapping("/update-user-details")
    public ResponseEntity<MessageResponse> updateUserDetails(@RequestBody RequestUserDTO dto) {
        Long userId = SecurityUtil.getCurrentUserId();
        Optional<User> userOptional = userService.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        return userService.updateUser(userId, dto);
    }

    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT','ADMIN')")
    @GetMapping
    public ResponseEntity<ResponseUserDTO> getCurrentUserDetails() {
        Long userId = SecurityUtil.getCurrentUserId();
        Optional<User> userOptional = userService.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOptional.get();
        Patient patient = patientService.getPatient(user);
        ResponseUserDTO userDTO = new ResponseUserDTO();
        userDTO.setId(user.getId());
        userDTO.setUserName(user.getUserName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setMiddleName(user.getMiddleName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEnabled(user.getEnabled());
        userDTO.setGender(patient.getGender());
        userDTO.setRoles(user.getRoles().stream()
                .map(role -> role.getRoleName().name())
                .collect(Collectors.toSet()));

        return ResponseEntity.ok(userDTO);
    }
}
