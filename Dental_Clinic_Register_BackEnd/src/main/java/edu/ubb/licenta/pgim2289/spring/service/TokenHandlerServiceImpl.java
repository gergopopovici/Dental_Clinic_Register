package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.security.JwtTokenProvider;
import edu.ubb.licenta.pgim2289.spring.security.UserDetailsImpl;
import org.springframework.stereotype.Service;

@Service
public class TokenHandlerServiceImpl implements TokenHandlerService {

    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    public TokenHandlerServiceImpl(RefreshTokenService refreshTokenService, JwtTokenProvider jwtTokenProvider) {
        this.refreshTokenService = refreshTokenService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public RefreshToken createAndStoreRefreshToken(User user) {
        refreshTokenService.deleteByUserId(user.getId());
        return refreshTokenService.createRefreshToken(user);
    }

    @Override
    public void verifyExpiration(RefreshToken token) {
        refreshTokenService.verifyExpiration(token);
    }

    @Override
    public String generateAccessTokenFromUser(User user) {
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        return jwtTokenProvider.generateAccessTokenFromUserDetails(userDetails);
    }

    @Override
    public void deleteRefreshTokenByUserId(Long id) {
        refreshTokenService.deleteByUserId(id);
    }
}
