package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.exception.InvalidInviteTokenException;
import edu.ubb.licenta.pgim2289.spring.model.DoctorInvite;
import edu.ubb.licenta.pgim2289.spring.repository.DoctorInviteRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class DoctorInviteServiceImpl implements DoctorInviteService {
    private final DoctorInviteRepository doctorInviteRepository;

    public DoctorInviteServiceImpl(DoctorInviteRepository doctorInviteRepository) {
        this.doctorInviteRepository = doctorInviteRepository;
    }

    @Override
    public void saveInvite(String email, String token) {
        doctorInviteRepository.deleteByEmail(email);
        DoctorInvite invite = new DoctorInvite();
        invite.setEmail(email);
        invite.setToken(token);
        invite.setExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        doctorInviteRepository.save(invite);

    }

    @Override
    public DoctorInvite validateToken(String token) {
        DoctorInvite invite = doctorInviteRepository.findByToken(token)
                .orElseThrow(() -> new InvalidInviteTokenException(
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
    public void markAsUsed(DoctorInvite invite) {
        invite.setUsed(true);
        doctorInviteRepository.save(invite);
    }
}
