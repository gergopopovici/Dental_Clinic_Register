package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.DoctorDropDownDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.RequestDoctorDTO;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.ServiceProvided;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.DoctorRepository;
import edu.ubb.licenta.pgim2289.spring.repository.ServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {
    private final DoctorRepository doctorRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceProvidedService serviceProvidedService;

    public DoctorServiceImpl(DoctorRepository doctorRepository, ServiceRepository serviceRepository, ServiceProvidedService serviceProvidedService) {
        this.doctorRepository = doctorRepository;
        this.serviceRepository = serviceRepository;
        this.serviceProvidedService = serviceProvidedService;
    }

    @Override
    public void createDoctor(User user, RequestDoctorDTO requestDoctorDTO) {
        Doctor doctor = new Doctor();
        user.setEnabled(true);
        doctor.setUser(user);
        doctor.setLicenseNumber(requestDoctorDTO.getLicenseNumber());
        doctor.setSpecialization(requestDoctorDTO.getSpecialization());
        List<ServiceProvided> selectedServices = serviceRepository.findAllById(requestDoctorDTO.getServiceIds());
        if (selectedServices.size() != requestDoctorDTO.getServiceIds().size()) {
            throw new IllegalArgumentException("error.invalid_service_ids");
        }
        doctor.setServices(selectedServices);
        doctorRepository.save(doctor);
    }

    @Override
    public Doctor getDoctor(User user) {
        return doctorRepository.findByUser(user);
    }

    @Override
    public List<DoctorDropDownDTO> getDoctorsByServiceId(Long serviceId) {
        return doctorRepository.findByServices_Id(serviceId).stream()
                .map(doctor -> {
                    DoctorDropDownDTO dto = new DoctorDropDownDTO();
                    dto.setUserId(doctor.getUser().getId());
                    dto.setFullName(doctor.getUser().getFullName());
                    dto.setSpecialization(doctor.getSpecialization());
                    return dto;
                })
                .toList();
    }

    @Override
    public Optional<Doctor> findById(Long id) {
        return doctorRepository.findById(id);
    }

    @Override
    public Optional<Doctor> findByUserId(Long id) {
        return doctorRepository.findByUser_Id(id);
    }

    @Override
    @Transactional
    public ResponseEntity<MessageResponse> updateDoctorServices(Long userId, List<Long> serviceIds) {
        Doctor doctor = doctorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("error.doctor.not_found"));
        List<ServiceProvided> newServices = serviceIds.stream()
                .map(id -> serviceProvidedService.findById(id)
                        .orElseThrow(() -> new IllegalArgumentException("error.invalid_service_ids")))
                .toList();
        doctor.setServices(newServices);
        doctorRepository.save(doctor);

        return ResponseEntity.ok(new MessageResponse("success.doctor.services.updated"));
    }
}
