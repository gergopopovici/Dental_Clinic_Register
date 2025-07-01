package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.User;

import java.security.InvalidParameterException;
import java.util.Collection;
import java.util.Optional;

public interface UserService {
    void createUser(User user) throws InvalidParameterException;
    Collection<User> getAllUsers();

    Optional<User> findByUserName(String username);
}
