package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ValidationResult;

public interface ValidationService {
    ValidationResult validateUserRegistration(RequestUserDTO dto);
}
