package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ValidationResult;
import edu.ubb.licenta.pgim2289.spring.repository.UserJpa;
import org.springframework.stereotype.Service;

@Service
public class ValidationServiceImpl implements ValidationService {

    private final UserJpa userRepository;
    private final PhoneNumberUtilService phoneNumberUtilService;

    public ValidationServiceImpl(UserJpa userRepository,
                                 PhoneNumberUtilService phoneNumberUtilService) {
        this.userRepository = userRepository;
        this.phoneNumberUtilService = phoneNumberUtilService;
    }

    @Override
    public ValidationResult validateUserRegistration(RequestUserDTO dto) {
        if (userRepository.existsByUserName(dto.getUsername())) {
            return ValidationResult.invalid("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ValidationResult.invalid("Error: Email is already in use!");
        }
        if (!phoneNumberUtilService.isValidPhoneNumber(dto.getPhoneNumber(),
                "RO")) {
            return ValidationResult.invalid("Error: Invalid Romanian phone number!");
        }
        return ValidationResult.success();
    }
}