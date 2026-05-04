package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestNewEmailDTO;
import edu.ubb.licenta.pgim2289.spring.service.AdminInviteService;
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
@RequestMapping("api/admin/admin_invite")
public class AdminInviteController {
    private final EmailService emailService;
    private final AdminInviteService adminInviteService;
    private final UserService userService;

    public AdminInviteController(EmailService emailService, AdminInviteService adminInviteService, UserService userService) {
        this.emailService = emailService;
        this.adminInviteService = adminInviteService;
        this.userService = userService;
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PostMapping("/send")
    public ResponseEntity<MessageResponse> inviteAdmin(@RequestBody RequestNewEmailDTO requestNewEmailDTO) {
        String email = requestNewEmailDTO.getEmail();
        if (userService.emailExistsChecker(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("error.invite.user_exists"));
        }
        String inviteToken = UUID.randomUUID().toString();
        adminInviteService.saveInvite(email, inviteToken);
        String frontendLink = "http://localhost:5175/register?inviteToken=" + inviteToken + "&role=admin";
        emailService.sendAdminInviteEmail(email, frontendLink);
        return ResponseEntity.ok(new MessageResponse("success.admin_invite.sent"));
    }

}
