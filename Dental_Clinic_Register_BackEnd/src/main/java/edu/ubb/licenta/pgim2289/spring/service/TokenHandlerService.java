package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.model.User;

public interface TokenHandlerService {
    RefreshToken createAndStoreRefreshToken(User user);

    void verifyExpiration(RefreshToken token);

    String generateAccessTokenFromUser(User user);

    void deleteRefreshTokenByUserId(Long id);
}
