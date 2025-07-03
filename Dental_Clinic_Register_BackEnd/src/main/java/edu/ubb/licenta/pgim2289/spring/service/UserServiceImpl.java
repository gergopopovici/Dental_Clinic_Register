package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.UserJpa;
import lombok.extern.slf4j.Slf4j;
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
        validateUsername(user);
        validatePassword(user);
        validateEmail(user);
        validatePhoneNumber(user);
        validateName(user);
    }

    private void validateUsername(User user) {
        String username = user.getUserName();
        if (username == null || username.isEmpty()) {
            throw new InvalidParameterException("Username is required");
        }
        if (userJpa.existsByUserName(username)) {
            throw new InvalidParameterException("Username already exists");
        }
    }

    private void validatePassword(User user) {
        String password = user.getPassword();
        if (password == null || password.isEmpty()) {
            throw new InvalidParameterException("Password is required");
        }
    }

    private void validateEmail(User user) {
        String email = user.getEmail();
        if (email == null || email.isEmpty()) {
            throw new InvalidParameterException("Email is required");
        }
        if (userJpa.existsByEmail(email)) {
            throw new InvalidParameterException("Email already exists");
        }
    }

    private void validatePhoneNumber(User user) {
        String phone = user.getPhoneNumber();
        if (phone == null || phone.length() != 10) {
            throw new InvalidParameterException("Phone number must contain exactly 10 digits.");
        }
        if (userJpa.existsByPhoneNumber(phone)) {
            throw new InvalidParameterException("Phone number already exists");
        }
    }

    private void validateName(User user) {
        if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
            throw new InvalidParameterException("First name is required");
        }
        if (user.getLastName() == null || user.getLastName().isEmpty()) {
            throw new InvalidParameterException("Last name is required");
        }
    }

}