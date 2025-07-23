package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static edu.ubb.licenta.pgim2289.spring.utils.AuthCookieUtil.createAccessTokenCookie;
import static edu.ubb.licenta.pgim2289.spring.utils.AuthCookieUtil.deleteAccessTokenCookie;

@Service
public class CookieManagementServiceImpl implements CookieManagementService {
    private final JwtTokenProvider jwtTokenProvider;

    CookieManagementServiceImpl(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void setAccessTokenCookie(String accessToken) {
        HttpServletResponse response = getCurrentHttpResponse();
        if (response != null) {
            int maxAgeSeconds = (int) (jwtTokenProvider.getJwtExpirationMs() / 1000);
            response.addCookie(createAccessTokenCookie(accessToken, maxAgeSeconds));
        }
    }

    @Override
    public void clearAccessTokenCookie() {
        HttpServletResponse response = getCurrentHttpResponse();
        if (response != null) {
            response.addCookie(deleteAccessTokenCookie());
        }
    }

    private HttpServletResponse getCurrentHttpResponse() {
        ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return (attrs != null) ? attrs.getResponse() : null;
    }
}
