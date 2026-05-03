package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.exception.InvalidInviteTokenException;
import edu.ubb.licenta.pgim2289.spring.model.AdminInvite;
import edu.ubb.licenta.pgim2289.spring.repository.AdminInviteRepository;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class AdminInviteServiceImpl implements AdminInviteService {
    private final AdminInviteRepository adminInviteRepository;
    private final UserRepository userRepository;

    public AdminInviteServiceImpl(AdminInviteRepository adminInviteRepository, UserRepository userRepository) {
        this.adminInviteRepository = adminInviteRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void saveInvite(String email, String token) {
        if (userRepository.existsByEmail(email)){
            throw new IllegalStateException("error.user.email.exists");
        }
        AdminInvite invite = adminInviteRepository.findByEmail(email).orElse(new AdminInvite());
        invite.setEmail(email);
        invite.setToken(token);
        invite.setExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        adminInviteRepository.save(invite);
    }

    @Override
    public AdminInvite validateToken(String token) {
        AdminInvite invite = adminInviteRepository.findByToken(token).orElseThrow(() -> new InvalidInviteTokenException(
                "error.invite.invalid",
                "Invite token is invalid or does not exist."
        ));
        if (invite.getUsed()) {
            throw new InvalidInviteTokenException(
                    "error.invite.used",
                    "This invite token has already been used."
            );
        }
        if (invite.getExpiryDate().isBefore(Instant.now())) {
            throw new InvalidInviteTokenException(
                    "error.invite.expired",
                    "This invite token has expired."
            );
        }
        return invite;
    }

    @Override
    public void markedAsUsed(AdminInvite adminInvite) {
        adminInvite.setUsed(true);
        adminInviteRepository.save(adminInvite);
    }
}
