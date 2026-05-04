package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.UserManagmentDTO;
import edu.ubb.licenta.pgim2289.spring.model.*;
import edu.ubb.licenta.pgim2289.spring.repository.RoleRepository;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationTokenJpa;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final VerificationTokenJpa verificationTokenRepository;
    private final RoleRepository roleRepository;
    private final PhoneNumberUtilService phoneNumberUtilService;
    private final RefreshTokenService refreshTokenService;
    private final FileStorageService fileStorageService;


    public UserServiceImpl(UserRepository userRepository, PasswordEncoder encoder,
                           VerificationTokenJpa verificationTokenRepository,
                           RoleRepository roleRepository,
                           PhoneNumberUtilService phoneNumberUtilService,
                           RefreshTokenService refreshTokenService, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.verificationTokenRepository = verificationTokenRepository;
        this.roleRepository = roleRepository;
        this.phoneNumberUtilService = phoneNumberUtilService;
        this.refreshTokenService = refreshTokenService;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public User createUser(RequestUserDTO dto) {
        User user = setUpUser(dto);
        Set<String> roleNamesForNewUser = dto.getRoles();
        log.info("roleNamesForNewUser: {}", roleNamesForNewUser);
        log.info("All roles from the Role entity: {}", roleRepository.findAll());
        User savedUser = registerUser(user, roleNamesForNewUser);
        return userRepository.save(savedUser);
    }

    @Override
    public User createAdminUser(RequestUserDTO dto) {
        User user = setUpUser(dto);
        user.setEnabled(true);
        return registerUser(user, dto.getRoles());
    }

    private User setUpUser(RequestUserDTO dto) {
        User user = new User();
        user.setUserName(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setMiddleName(dto.getMiddleName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setGender(dto.getGender());
        user.setDateOfBirth(dto.getDateOfBirth());
        return user;
    }

    @Override
    public ResponseEntity<MessageResponse> verifyUserAccount(String token) {
        Optional<VerificationToken> optionalToken = verificationTokenRepository.findByToken(token);
        if (optionalToken.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid verification token!"));
        }

        VerificationToken verificationToken = optionalToken.get();
        if (verificationToken.isUsed()) {
            return ResponseEntity.ok(new MessageResponse("Account has already "
                    + "been verified!"));
        }

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: "
                    + "Verification token has expired!"));
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
        return ResponseEntity.ok(new MessageResponse("Account verified successfully!"
                + "You can now log in."));
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public ResponseEntity<MessageResponse> deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            Optional<User> userOptional = userRepository.findById(id);
            User user = userOptional.get();
            String scrambledEmail = "deleted_" + UUID.randomUUID().toString() + "@anonymised.com";
            user.setEmail(scrambledEmail);
            user.setFirstName("Deleted");
            user.setLastName("Patient");
            user.setPhoneNumber(UUID.randomUUID().toString().substring(0, 10));
            user.setEnabled(false);
            return ResponseEntity.ok(new MessageResponse("success.user.deleted"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("error.user.not_found"));
        }
    }

    @Override
    public ResponseEntity<MessageResponse> updateEmail(Long id, String email) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.get();
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$";
        if (!email.matches(emailRegex)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid email format!"));
        }
        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email already exist!"));
        }
        user.setEmail(email);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
    }

    @Override
    public ResponseEntity<MessageResponse> updatePassword(Long id, String password) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.get();
        String passwordRegex = "^[a-zA-Z0-9]{6,16}$";
        if (!password.matches(passwordRegex)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid password format!"));
        }
        user.setPassword(encoder.encode(password));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully!"));
    }

    @Override
    public ResponseEntity<MessageResponse> updateUser(Long id, RequestUserDTO dto) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.get();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setMiddleName(dto.getMiddleName());
        user.setDateOfBirth(dto.getDateOfBirth());
        user.setGender(dto.getGender());
        if (!user.getPhoneNumber().equals(dto.getPhoneNumber())
                && userRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error:"
                    + " Phone number already exist!"));
        }
        if (!phoneNumberUtilService.isValidPhoneNumber(dto.getPhoneNumber(), "RO")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid phone number!"));
        }
        user.setPhoneNumber(dto.getPhoneNumber());
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User updated successfully!"));
    }

    @Override
    public ResponseEntity<MessageResponse> updatePhoneNumber(Long id, String phoneNumber) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.get();
        if (!user.getPhoneNumber().equals(phoneNumber) && userRepository.existsByPhoneNumber(phoneNumber)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number already exist!"));
        }
        if (!phoneNumberUtilService.isValidPhoneNumber(phoneNumber, "RO")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid phone number!"));
        }
        user.setPhoneNumber(phoneNumber);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Phone number updated successfully!"));
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUserName(username);
    }

    @Override
    public Boolean emailExistsChecker(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public Optional<RefreshToken> findByRefreshToken(String token) {
        return refreshTokenService.findByToken(token);

    }

    @Transactional
    @Override
    public String updateProfilePicture(Long userId, MultipartFile fileName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldProfilePictureFileName = user.getProfilePictureUrl();

        String newFileName = fileStorageService.storeFile(fileName);

        user.setProfilePictureUrl(newFileName);
        userRepository.save(user); // Save the updated user

        if (oldProfilePictureFileName != null && !oldProfilePictureFileName.isEmpty()) {
            fileStorageService.deleteFile(oldProfilePictureFileName);
        }

        return newFileName;
    }

    @Override
    public long countPatients() {
        return userRepository.countPatients();
    }

    @Override
    public long countDoctors() {
        return userRepository.countDoctors();
    }

    @Override
    public long countBanned() {
        return userRepository.countByEnabledFalse();
    }

    @Override
    public List<UserManagmentDTO> getAllUsersForAdmin() {
        return userRepository.findAll().stream().map(user -> {
            String fullName = user.getFirstName() + " " + user.getLastName();
            String role = user.getRoles().isEmpty() ? "NONE" :
                    user.getRoles().iterator().next().getRoleName().name();

            return new UserManagmentDTO(
                    user.getId(),
                    user.getUserName(),
                    fullName,
                    user.getEmail(),
                    role,
                    user.getEnabled()
            );
        }).toList();
    }

    public User registerUser(User user, Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByRoleName(Role.RoleName.valueOf(roleName))
                    .orElseThrow(() -> new RuntimeException("Error:"
                            + " Role not found."));
            roles.add(role);
        }
        user.setRoles(roles);
        return userRepository.save(user);
    }


}
