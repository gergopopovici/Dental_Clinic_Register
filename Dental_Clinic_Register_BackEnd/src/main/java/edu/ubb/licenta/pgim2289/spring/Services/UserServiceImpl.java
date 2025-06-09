package edu.ubb.licenta.pgim2289.spring.Services;

import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.UserJpa;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.InvalidParameterException;
import java.util.Collection;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserJpa userJpa;

    public UserServiceImpl(UserJpa userJpa) {
        this.userJpa = userJpa;
    }

    @Override
    public void createUser(User user) throws InvalidParameterException {
        log.info("Creating user: " + user.getUserName());
        validateUser(user);
        userJpa.save(user);
    }

    @Override
    public Collection<User> getAllUsers() {
        return userJpa.findAll();
    }

    public void validateUser(User user) {
        if (user.getUserName() == null || user.getUserName().isEmpty()) {
            throw new InvalidParameterException("Username is required");
        }
        if (userJpa.existsByUserName(user.getUserName())) {
            throw new InvalidParameterException("Username already exists");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new InvalidParameterException("Password is required");
        }
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new InvalidParameterException("Email is required");
        }
        if (userJpa.existsByEmail(user.getEmail())) {
            throw new InvalidParameterException("Email already exists");
        }
        if (userJpa.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new InvalidParameterException("Phone number already exists");
        }
        if (user.getPhoneNumber() == null
                || String.valueOf(user.getPhoneNumber()).length() != 10) { // Also corrected to 10 digits as is standard for phone numbers
            throw new InvalidParameterException("Phone number must contain exactly 10 digits.");
        }
        if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
            throw new InvalidParameterException("First name is required");
        }
        if (user.getLastName() == null || user.getLastName().isEmpty()) {
            throw new InvalidParameterException("Last name is required");
        }
    }
}