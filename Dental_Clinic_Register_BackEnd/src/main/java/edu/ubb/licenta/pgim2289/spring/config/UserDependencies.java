package edu.ubb.licenta.pgim2289.spring.config;

import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import edu.ubb.licenta.pgim2289.spring.service.PhoneNumberUtilService;
import lombok.Getter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Getter
public class UserDependencies {
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final PhoneNumberUtilService phoneNumberUtilService;

    public UserDependencies(UserRepository userRepository,
                            PasswordEncoder encoder,
                            PhoneNumberUtilService phoneNumberUtilService) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.phoneNumberUtilService = phoneNumberUtilService;
    }
}
