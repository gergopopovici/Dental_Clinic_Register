package edu.ubb.licenta.pgim2289.spring.security;

import io.jsonwebtoken.*;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.info("JwtAuthenticationFilter: Processing request for URI: {}", request.getRequestURI()); // Always log URI

        Cookie[] cookies = request.getCookies();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.info("JwtAuthenticationFilter: Skipping for OPTIONS method.");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jwt = null;
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("auth_token".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        log.info("JwtAuthenticationFilter: Found 'auth_token' cookie.");
                        break;
                    }
                }
            }

            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateJwtToken(jwt)) {
                log.info("JwtAuthenticationFilter: JWT is valid.");
                String username = jwtTokenProvider.getUserNameFromJwtToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (userDetails.isEnabled()) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("JwtAuthenticationFilter: SecurityContextHolder populated for user: {}", username);
                } else {
                    log.warn("JwtAuthenticationFilter: User {} is disabled.", username);
                }
            } else {
                log.warn("JwtAuthenticationFilter: JWT is missing or"
                        + " invalid for URI: {}", request.getRequestURI());
            }
        } catch (JwtException | AuthenticationException ex) {
            log.error("JwtAuthenticationFilter: Could not set user authentication"
                    + " in security context for URI: {}", request.getRequestURI(), ex);
        }

        filterChain.doFilter(request, response);
    }

    /*
     private String getJwtFromRequest(HttpServletRequest request) {
         String bearerToken = request.getHeader("Authorization");
         if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
             return bearerToken.substring(7);
         }
         return null;
     }
    */
}
