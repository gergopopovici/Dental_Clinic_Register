package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ValidationResult;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ValidationServiceImpl implements ValidationService {

    private final UserRepository userRepository;
    private final PhoneNumberUtilService phoneNumberUtilService;

    public ValidationServiceImpl(UserRepository userRepository,
                                 PhoneNumberUtilService phoneNumberUtilService) {
        this.userRepository = userRepository;
        this.phoneNumberUtilService = phoneNumberUtilService;
    }

    @Override
    public ValidationResult validateUserRegistration(RequestUserDTO dto) {
        if (userRepository.existsByUserName(dto.getUsername())) {
            return ValidationResult.invalid("error.signup.username_taken");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ValidationResult.invalid("error.signup.email_in_use");
        }
        if (!phoneNumberUtilService.isValidPhoneNumber(dto.getPhoneNumber(),
                "RO")) {
            return ValidationResult.invalid("error.signup.invalid_phone");
        }
        return ValidationResult.success();
    }
}