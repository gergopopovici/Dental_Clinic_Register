package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.DoctorInvite;

public interface DoctorInviteService {
    void saveInvite(String email, String token);

    DoctorInvite validateToken(String token);

    void markAsUsed(DoctorInvite invite);
}
