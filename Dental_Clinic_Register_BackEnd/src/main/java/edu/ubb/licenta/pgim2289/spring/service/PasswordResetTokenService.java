package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.exception.TokenAccessedException;
import edu.ubb.licenta.pgim2289.spring.exception.TokenExpiredException;
import edu.ubb.licenta.pgim2289.spring.exception.UserNotFoundException;
import edu.ubb.licenta.pgim2289.spring.model.PasswordResetToken;

public interface PasswordResetTokenService {
    void savePasswordResetToken(PasswordResetToken passwordResetToken)
            throws UserNotFoundException;
    void accessPasswordResetToken(PasswordResetToken passwordResetToken)
        throws TokenExpiredException, TokenAccessedException;
}
