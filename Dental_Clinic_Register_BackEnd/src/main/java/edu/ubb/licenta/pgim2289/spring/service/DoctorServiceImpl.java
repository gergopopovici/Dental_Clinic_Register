package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.DoctorDropDownDTO;
import edu.ubb.licenta.pgim2289.spring.dto.RequestDoctorDTO;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.ServiceProvided;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.DoctorRepository;
import edu.ubb.licenta.pgim2289.spring.repository.ServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorServiceImpl implements DoctorService {
    private final DoctorRepository doctorRepository;
    private final ServiceRepository serviceRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository, ServiceRepository serviceRepository) {
        this.doctorRepository = doctorRepository;
        this.serviceRepository = serviceRepository;
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
}
