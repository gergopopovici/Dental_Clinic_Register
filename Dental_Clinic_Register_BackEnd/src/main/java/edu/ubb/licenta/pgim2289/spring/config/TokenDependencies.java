package edu.ubb.licenta.pgim2289.spring.config;

import edu.ubb.licenta.pgim2289.spring.repository.RefreshTokenJpa;
import edu.ubb.licenta.pgim2289.spring.security.JwtTokenProvider;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Getter
public class TokenDependencies {
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final RefreshTokenJpa refreshTokenRepository;

    public TokenDependencies(JwtTokenProvider jwtTokenProvider,
                             JwtProperties jwtProperties,
                             RefreshTokenJpa refreshTokenRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.jwtProperties = jwtProperties;
        this.refreshTokenRepository = refreshTokenRepository;
    }
}
