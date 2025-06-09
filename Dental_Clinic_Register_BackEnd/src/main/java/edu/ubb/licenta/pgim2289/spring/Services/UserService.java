package edu.ubb.licenta.pgim2289.spring.Services;

import edu.ubb.licenta.pgim2289.spring.model.User;

import java.security.InvalidParameterException;
import java.util.Collection;

public interface UserService {
    void createUser(User user) throws InvalidParameterException;
    Collection<User> getAllUsers();
}
