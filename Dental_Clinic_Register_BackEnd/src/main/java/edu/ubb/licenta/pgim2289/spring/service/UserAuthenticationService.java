package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;

import java.util.Optional;

public interface UserAuthenticationService {
    Optional<User> findByUsername(String username);

}
