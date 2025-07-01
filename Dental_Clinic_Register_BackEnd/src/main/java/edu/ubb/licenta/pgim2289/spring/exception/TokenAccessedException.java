package edu.ubb.licenta.pgim2289.spring.exception;

public class TokenAccessedException extends RuntimeException{
    public TokenAccessedException() {
        super("Token has already been accessed");
    }
    public TokenAccessedException(String message) {
        super(message);
    }
    public TokenAccessedException(String message, Throwable cause) {
        super(message, cause);
    }
}
