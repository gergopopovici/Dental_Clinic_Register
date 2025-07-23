package edu.ubb.licenta.pgim2289.spring.service;

public interface CookieManagementService {
    void setAccessTokenCookie(String accessToken);

    void clearAccessTokenCookie();
}
