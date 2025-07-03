package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.TokenResponse;
import org.springframework.security.core.Authentication;

public interface TokenService {
    TokenResponse createTokensForUser(Long userId, Authentication authentication);

    void revokeUserTokens(Long userId);
}