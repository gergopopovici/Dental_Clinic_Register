package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.UserManagmentDTO;
import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;


public interface UserService {
    User createUser(RequestUserDTO dto);

    User createAdminUser(RequestUserDTO dto);

    ResponseEntity<MessageResponse> verifyUserAccount(String token);

    Optional<User> findById(Long id);

    ResponseEntity<MessageResponse> deleteUser(Long id);

    ResponseEntity<MessageResponse> updateEmail(Long id, String email);

    ResponseEntity<MessageResponse> updatePassword(Long id, String password);

    ResponseEntity<MessageResponse> updateUser(Long id, RequestUserDTO dto);

    ResponseEntity<MessageResponse> updatePhoneNumber(Long id, String phoneNumber);

    Optional<User> findByUsername(String username);

    Boolean emailExistsChecker(String email);

    Optional<RefreshToken> findByRefreshToken(String token);

    String updateProfilePicture(Long userId, MultipartFile fileName);

    long countPatients();

    long countDoctors();

    long countBanned();

    List<UserManagmentDTO> getAllUsersForAdmin();
}
