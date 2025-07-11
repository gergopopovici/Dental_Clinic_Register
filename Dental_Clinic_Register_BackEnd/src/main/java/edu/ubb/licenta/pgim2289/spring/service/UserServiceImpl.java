package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Role;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.model.VerificationToken;
import edu.ubb.licenta.pgim2289.spring.repository.RoleRepository;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationTokenJpa;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final VerificationTokenJpa verificationTokenRepository;
    private final RoleRepository roleRepository;
    private final PhoneNumberUtilService phoneNumberUtilService;


    public UserServiceImpl(UserRepository userRepository, PasswordEncoder encoder,
                           VerificationTokenJpa verificationTokenRepository,
                           RoleRepository roleRepository,
                           PhoneNumberUtilService phoneNumberUtilService) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.verificationTokenRepository = verificationTokenRepository;
        this.roleRepository = roleRepository;
        this.phoneNumberUtilService = phoneNumberUtilService;
    }

    @Override
    public User createUser(RequestUserDTO dto) {
        User user = new User();
        user.setUserName(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setMiddleName(dto.getMiddleName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        Set<String> roleNamesForNewUser = dto.getRoles();
        log.info("roleNamesForNewUser: {}", roleNamesForNewUser);
        log.info("All roles from the Role entity: {}", roleRepository.findAll());
        User savedUser = registerUser(user, roleNamesForNewUser);
        return userRepository.save(savedUser);
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
            userRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully!"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
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
