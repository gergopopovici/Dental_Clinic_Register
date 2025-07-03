package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.model.VerificationToken;
import edu.ubb.licenta.pgim2289.spring.repository.UserJpa;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationTokenJpa;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserJpa userRepository;
    private final PasswordEncoder encoder;
    private final VerificationTokenJpa verificationTokenRepository;


    public UserServiceImpl(UserJpa userRepository, PasswordEncoder encoder,
                           VerificationTokenJpa verificationTokenRepository) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.verificationTokenRepository = verificationTokenRepository;
    }

    @Override
    public User createUser(RequestUserDTO dto) {
        User user = new User();
        user.setUserName(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setPatient(true);
        user.setDoctor(false);
        user.setAdministrator(false);
        return userRepository.save(user);
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


}
