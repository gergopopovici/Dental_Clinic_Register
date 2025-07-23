package edu.ubb.licenta.pgim2289.spring.exception;

public class TokenRefreshException extends RuntimeException {
    public TokenRefreshException(String message, String s) {
        super(message + s);
    }

    public TokenRefreshException(String message) {
        super(message);
    }
}
