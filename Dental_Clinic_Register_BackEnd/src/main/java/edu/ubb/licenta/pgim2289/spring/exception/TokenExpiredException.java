package edu.ubb.licenta.pgim2289.spring.exception;

public class TokenExpiredException extends RuntimeException {
    public TokenExpiredException() {
        super("Token has already been expired");
    }

    public TokenExpiredException(String message) {
        super(message);
    }

    public TokenExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}
