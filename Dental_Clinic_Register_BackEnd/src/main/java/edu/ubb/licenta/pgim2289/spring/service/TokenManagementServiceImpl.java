package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.exception.TokenRefreshException;
import edu.ubb.licenta.pgim2289.spring.model.AuthTokenPair;
import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TokenManagementServiceImpl implements TokenManagementService {
    private final TokenHandlerService tokenHandlerService;
    private final UserService userService;

    TokenManagementServiceImpl(TokenHandlerService tokenHandlerService, UserService userService) {
        this.tokenHandlerService = tokenHandlerService;
        this.userService = userService;
    }

    @Override
    public AuthTokenPair generateTokenPair(User user) {
        String accessToken = tokenHandlerService.generateAccessTokenFromUser(user);
        RefreshToken refreshToken = tokenHandlerService.createAndStoreRefreshToken(user);
        return new AuthTokenPair(accessToken, refreshToken.getToken());
    }

    @Override
    public AuthTokenPair refreshTokens(String refreshTokenValue) {
        Optional<RefreshToken> tokenOpt = userService.findByRefreshToken(refreshTokenValue);

        if (tokenOpt.isEmpty()) {
            throw new TokenRefreshException("Refresh token not found");
        }

        RefreshToken storedRefreshToken = tokenOpt.get();
        tokenHandlerService.verifyExpiration(storedRefreshToken);

        User user = storedRefreshToken.getUser();
        if (user == null) {
            throw new TokenRefreshException("User not found for refresh token");
        }

        String newAccessToken = tokenHandlerService.generateAccessTokenFromUser(user);
        return new AuthTokenPair(newAccessToken, storedRefreshToken.getToken());
    }

    @Override
    public void revokeAllTokensForUser(Long userId) {
        tokenHandlerService.deleteRefreshTokenByUserId(userId);
    }

    @Override
    public User getUserFromRefreshToken(String refreshTokenValue) {
        return userService.findByRefreshToken(refreshTokenValue)
                .map(RefreshToken::getUser)
                .orElseThrow(() -> new TokenRefreshException("User not found"
                        + " for refresh token"));
    }
}
