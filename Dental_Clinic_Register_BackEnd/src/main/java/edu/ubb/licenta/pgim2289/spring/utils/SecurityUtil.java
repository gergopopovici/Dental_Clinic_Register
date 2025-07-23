package edu.ubb.licenta.pgim2289.spring.utils;

import edu.ubb.licenta.pgim2289.spring.security.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found in SecurityContext.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        } else {
            throw new IllegalStateException("Authenticated principal is not of type UserDetailsImpl.");
        }
    }
}
