package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserAuthenticationServiceImpl implements UserAuthenticationService {

    private final UserService userService;

    public UserAuthenticationServiceImpl(UserService userService) {
        this.userService = userService;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userService.findByUsername(username);
    }
}
