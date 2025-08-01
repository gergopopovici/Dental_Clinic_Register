package edu.ubb.licenta.pgim2289.spring.exception;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.security.InvalidParameterException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidParameterException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> handleInvalidParameters(InvalidParameterException ex) {
        Map<String, String> errorMap = new ConcurrentHashMap<>();
        errorMap.put("error", ex.getMessage());
        return errorMap;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new ConcurrentHashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleUserNotFound(UserNotFoundException ex) {
        Map<String, String> errorMap = new ConcurrentHashMap<>();
        errorMap.put("error", ex.getMessage());
        return errorMap;
    }

    @ExceptionHandler(TokenExpiredException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> handleTokenExpiredException(TokenExpiredException ex) {
        Map<String, String> errorMap = new ConcurrentHashMap<>();
        errorMap.put("error", ex.getMessage());
        return errorMap;
    }

    @ExceptionHandler(TokenAccessedException.class)
    @ResponseStatus(HttpStatus.GONE)
    public Map<String, String> handleTokenAccessedException(TokenAccessedException ex) {
        Map<String, String> errorMap = new ConcurrentHashMap<>();
        errorMap.put("error", ex.getMessage());
        return errorMap;
    }

    @ExceptionHandler(AuthenticationManagerException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleAuthenticationManagerException(AuthenticationManagerException ex) {
        Map<String, String> errorMap = new ConcurrentHashMap<>();
        errorMap.put("error", ex.getMessage());
        return errorMap;
    }

    @ExceptionHandler(TokenRefreshException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, String> handleTokenRefreshException(TokenRefreshException ex) {
        Map<String, String> errorMap = new ConcurrentHashMap<>();
        errorMap.put("error", ex.getMessage());
        return errorMap;
    }
}