package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.AdminInvite;

public interface AdminInviteService{
    void saveInvite(String email, String token);
    AdminInvite validateToken(String token);
    void markedAsUsed(AdminInvite adminInvite);
}
