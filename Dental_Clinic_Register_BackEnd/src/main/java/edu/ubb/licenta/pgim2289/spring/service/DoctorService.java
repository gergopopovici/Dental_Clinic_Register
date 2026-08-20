package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface DoctorService {
    void createDoctor(User user, RequestDoctorDTO requestDoctorDTO);

    Doctor getDoctor(User user);

    List<DoctorDropDownDTO> getDoctorsByServiceId(Long serviceId);

    Optional<Doctor> findById(Long id);

    Optional<Doctor> findByUserId(Long id);

    ResponseEntity<MessageResponse> updateDoctorServices(Long userId, List<Long> serviceIds);

    List<ResponseServiceDTO> getOfferedServicesForDoctor(Long userId);
}
