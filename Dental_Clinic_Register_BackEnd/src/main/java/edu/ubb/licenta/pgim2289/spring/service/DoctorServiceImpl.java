package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.DoctorRepository;
import org.springframework.stereotype.Service;

@Service
public class DoctorServiceImpl implements DoctorService {
    private final DoctorRepository doctorRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Override
    public void createDoctor(User user, RequestUserDTO requestUserDTO) {
        Doctor doctor = new Doctor();
        user.setEnabled(true);
        doctor.setUser(user);
        doctor.setLicenseNumber(requestUserDTO.getLicenseNumber());
        doctor.setSpecialization(requestUserDTO.getSpecialisation());
        doctorRepository.save(doctor);
    }

    @Override
    public Doctor getDoctor(User user) {
        return doctorRepository.findByUser(user);
    }
}
