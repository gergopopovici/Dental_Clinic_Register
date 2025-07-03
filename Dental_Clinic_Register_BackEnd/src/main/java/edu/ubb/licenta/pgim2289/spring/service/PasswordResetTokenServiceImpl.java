package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.exception.TokenAccessedException;
import edu.ubb.licenta.pgim2289.spring.exception.TokenExpiredException;
import edu.ubb.licenta.pgim2289.spring.exception.UserNotFoundException;
import edu.ubb.licenta.pgim2289.spring.model.PasswordResetToken;
import edu.ubb.licenta.pgim2289.spring.repository.PasswordResetTokenJpa;
import edu.ubb.licenta.pgim2289.spring.repository.UserJpa;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PasswordResetTokenServiceImpl implements PasswordResetTokenService {

    private final PasswordResetTokenJpa passwordResetTokenJpa;
    private final UserJpa userJpa;
    private final Logger logger = LoggerFactory.getLogger(PasswordResetTokenServiceImpl.class);

    public PasswordResetTokenServiceImpl(PasswordResetTokenJpa passwordResetTokenJpa,
                                         UserJpa userJpa) {
        this.passwordResetTokenJpa = passwordResetTokenJpa;
        this.userJpa = userJpa;
    }


    @Override
    public void savePasswordResetToken(PasswordResetToken passwordResetToken)
            throws UserNotFoundException {
        logger.info("Saving password reset token");
        logger.info(passwordResetToken.toString());
        logger.info(passwordResetToken.getUser().getEmail());
        logger.info(String.valueOf(passwordResetToken.getUser().getId()));
        if (userJpa.existsById(passwordResetToken.getUser().getId())) {
            passwordResetToken.setExpiryTime(passwordResetToken.getCreatedAt()
                    .plusMinutes(30));
            passwordResetToken.setUsed(false);
            passwordResetTokenJpa.save(passwordResetToken);
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void accessPasswordResetToken(PasswordResetToken passwordResetToken) throws
            TokenExpiredException, TokenAccessedException {
        if (passwordResetToken.isUsed()) {
            throw new TokenAccessedException();
        }
        if (passwordResetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException();
        }
        passwordResetToken.setUsed(true);
        passwordResetTokenJpa.save(passwordResetToken);
    }


}
