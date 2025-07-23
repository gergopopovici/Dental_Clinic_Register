package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.config.JwtProperties;
import edu.ubb.licenta.pgim2289.spring.dto.TokenResponse;
import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.repository.RefreshTokenJpa;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import edu.ubb.licenta.pgim2289.spring.security.JwtTokenProvider;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class TokenServiceImpl implements TokenService {

    private final RefreshTokenJpa refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    public TokenServiceImpl(RefreshTokenJpa refreshTokenRepository, UserRepository userRepository,
                            JwtTokenProvider jwtTokenProvider, JwtProperties jwtProperties) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
    }

    @Override
    public TokenResponse createTokensForUser(Long userId, Authentication authentication) {
        refreshTokenRepository.deleteByUserId(userId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(userRepository.findById(userId).orElseThrow());
        refreshToken.setExpiryDate(Instant.now().plusMillis(jwtProperties
                .getRefreshTokenExpirationMs()));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshTokenRepository.save(refreshToken);

        String jwt = jwtTokenProvider.generateAccessToken(authentication);

        return new TokenResponse(jwt, refreshToken.getToken());
    }

    @Override
    public void revokeUserTokens(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
