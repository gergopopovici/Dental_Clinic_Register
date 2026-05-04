package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestNewEmailDTO;
import edu.ubb.licenta.pgim2289.spring.service.DoctorInviteService;
import edu.ubb.licenta.pgim2289.spring.service.EmailService;
import edu.ubb.licenta.pgim2289.spring.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/invites")
public class DoctorInviteController {
    private final EmailService emailService;
    private final UserService userService;
    private final DoctorInviteService doctorInviteService;

    public DoctorInviteController(EmailService emailService,
                                  UserService userService,
                                  DoctorInviteService doctorInviteService) {
        this.emailService = emailService;
        this.userService = userService;
        this.doctorInviteService = doctorInviteService;
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping("/send")
    public ResponseEntity<MessageResponse> inviteDoctor(@RequestBody RequestNewEmailDTO requestNewEmailDTO) {
        String email = requestNewEmailDTO.getEmail();
        if (userService.emailExistsChecker(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("error.invite.user_exists"));
        }
        String inviteToken = UUID.randomUUID().toString();
        doctorInviteService.saveInvite(email, inviteToken);
        String frontendLink = "http://localhost:5175/register?inviteToken=" + inviteToken + "&role=doctor";
        emailService.sendDoctorInviteEmail(email, frontendLink);
        return ResponseEntity.ok(new MessageResponse("success.invite.sent"));
    }
}
