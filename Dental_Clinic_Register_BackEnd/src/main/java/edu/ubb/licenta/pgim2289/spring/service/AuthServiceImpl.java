package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.exception.TokenRefreshException;
import edu.ubb.licenta.pgim2289.spring.model.AuthTokenPair;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserAuthenticationService userAuthService;
    private final UserRegistrationService userRegistrationService;
    private final PasswordManagementService passwordManagementService;
    private final TokenManagementService tokenManagementService;
    private final CookieManagementService cookieManagementService;

    @Override
    @Transactional
    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userAuthService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after authentication."));

        AuthTokenPair tokenPair = tokenManagementService.generateTokenPair(user);
        cookieManagementService.setAccessTokenCookie(tokenPair.getAccessToken());

        return new LoginResponse(
                null,
                tokenPair.getRefreshToken(),
                "Bearer",
                userDetails.getUsername()
        );
    }

    @Override
    public ResponseEntity<MessageResponse> registerUser(RequestUserDTO dto) {
        return userRegistrationService.registerUser(dto);
    }

    @Override
    public ResponseEntity<MessageResponse> verifyAccount(String token) {
        return userRegistrationService.verifyAccount(token);
    }

    @Override
    public ResponseEntity<MessageResponse> forgotPassword(RequestPasswordResetTokenDTO dto) {
        return passwordManagementService.initiateForgotPassword(dto);
    }

    @Override
    public ResponseEntity<MessageResponse> resetPassword(ResponsePasswordResetTokenDTO dto) {
        return passwordManagementService.resetPassword(dto);
    }

    @Override
    @Transactional
    public ResponseEntity<MessageResponse> logoutUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl userDetails) {
            userAuthService.findByUsername(userDetails.getUsername())
                    .ifPresent(user -> tokenManagementService
                            .revokeAllTokensForUser(user.getId()));

            cookieManagementService.clearAccessTokenCookie();
        }

        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Log out successful!"));
    }

    @Override
    @Transactional
    public ResponseEntity<LoginResponse> refreshToken(RequestRefreshTokenDTO
                                                              refreshTokenRequest) {
        try {
            AuthTokenPair tokenPair = tokenManagementService.refreshTokens(
                    refreshTokenRequest.getRefreshToken());
            cookieManagementService.setAccessTokenCookie(tokenPair.getAccessToken());

            User user = tokenManagementService.getUserFromRefreshToken(
                    refreshTokenRequest.getRefreshToken());

            return ResponseEntity.ok(new LoginResponse(
                    tokenPair.getAccessToken(),
                    tokenPair.getRefreshToken(),
                    "Bearer",
                    user.getUserName()
            ));
        } catch (TokenRefreshException e) {
            cookieManagementService.clearAccessTokenCookie();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(null, null, "Bearer", null));
        }
    }
}