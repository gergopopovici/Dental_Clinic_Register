package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.http.ResponseEntity;



public interface UserService {
    User createUser(RequestUserDTO dto);

    ResponseEntity<MessageResponse> verifyUserAccount(String token);
}
