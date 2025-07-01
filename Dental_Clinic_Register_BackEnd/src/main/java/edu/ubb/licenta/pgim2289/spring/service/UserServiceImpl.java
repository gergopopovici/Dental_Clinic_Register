package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.UserJpa;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.InvalidParameterException;
import java.util.Collection;
import java.util.Optional;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserJpa userJpa;
    private final PasswordEncoder passwordEncoder;
    private final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    public UserServiceImpl(UserJpa userJpa, PasswordEncoder passwordEncoder) {
        this.userJpa = userJpa;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void createUser(User user) throws InvalidParameterException {
        log.info("Creating user: " + user.getUserName());
        validateUser(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userJpa.save(user);
    }

    @Override
    public Collection<User> getAllUsers() {
        return userJpa.findAll();
    }

    @Override
    public Optional<User> findByUserName(String username) {
        return userJpa.findByUserName(username);
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
                || user.getPhoneNumber().length() != 10) {
            throw new InvalidParameterException("Phone number " +
                    "must contain exactly 10 digits.");
        }
        if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
            throw new InvalidParameterException("First name is required");
        }
        if (user.getLastName() == null || user.getLastName().isEmpty()) {
            throw new InvalidParameterException("Last name is required");
        }
    }
}