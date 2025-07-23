package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.AuthTokenPair;
import edu.ubb.licenta.pgim2289.spring.model.User;

public interface TokenManagementService {
    AuthTokenPair generateTokenPair(User user);

    AuthTokenPair refreshTokens(String refreshTokenValue);

    void revokeAllTokensForUser(Long userId);

    User getUserFromRefreshToken(String refreshTokenValue);
}
