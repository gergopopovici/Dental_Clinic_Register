package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.DoctorDropDownDTO;
import edu.ubb.licenta.pgim2289.spring.dto.RequestDoctorDTO;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.User;

import java.util.List;
import java.util.Optional;

public interface DoctorService {
    void createDoctor(User user, RequestDoctorDTO requestDoctorDTO);
    Doctor getDoctor(User user);
    List<DoctorDropDownDTO> getDoctorsByServiceId(Long serviceId);
    Optional<Doctor> findById(Long id);
}
