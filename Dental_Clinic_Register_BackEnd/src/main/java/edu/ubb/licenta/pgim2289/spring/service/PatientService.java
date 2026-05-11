package edu.ubb.licenta.pgim2289.spring.service;


import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Patient;
import edu.ubb.licenta.pgim2289.spring.model.User;

import java.util.Optional;

public interface PatientService {
    void createPatient(RequestUserDTO dto);

    Patient getPatient(User user);
    Optional<Patient> findById(Long id);
}
