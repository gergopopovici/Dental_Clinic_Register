package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.http.ResponseEntity;

import java.util.Optional;


public interface UserService {
    User createUser(RequestUserDTO dto);

    ResponseEntity<MessageResponse> verifyUserAccount(String token);

    Optional<User> findById(Long id);

    ResponseEntity<MessageResponse> deleteUser(Long id);

    ResponseEntity<MessageResponse> updateEmail(Long id, String email);

    ResponseEntity<MessageResponse> updatePassword(Long id, String password);

    ResponseEntity<MessageResponse> updateUser(Long id, RequestUserDTO dto);

    ResponseEntity<MessageResponse> updatePhoneNumber(Long id, String phoneNumber);

    Optional<User> findByUsername(String username);

    Optional<RefreshToken> findByRefreshToken(String token);
}
