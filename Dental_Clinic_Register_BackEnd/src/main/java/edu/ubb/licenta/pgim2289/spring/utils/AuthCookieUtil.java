package edu.ubb.licenta.pgim2289.spring.utils;

import jakarta.servlet.http.Cookie;

public class AuthCookieUtil {
    public static Cookie createAccessTokenCookie(String token, int maxAgeSeconds) {
        Cookie cookie = new Cookie("auth_token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        cookie.setSecure(false);
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

    public static Cookie deleteAccessTokenCookie() {
        Cookie cookie = new Cookie("auth_token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setSecure(false);
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }
}

