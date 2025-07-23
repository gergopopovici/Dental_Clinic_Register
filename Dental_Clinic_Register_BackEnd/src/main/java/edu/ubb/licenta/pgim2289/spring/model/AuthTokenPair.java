package edu.ubb.licenta.pgim2289.spring.model;

public class AuthTokenPair {
    private final String accessToken;
    private final String refreshToken;

    public AuthTokenPair(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }
}
