package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.PatientDropDownDTO;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Patient;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.PatientRepository;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final SequenceGeneratorService sequenceGenerator;

    public PatientServiceImpl(PatientRepository patientRepository,
                              UserRepository userRepository,
                              SequenceGeneratorService sequenceGenerator) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.sequenceGenerator = sequenceGenerator;
    }

    @Override
    public void createPatient(RequestUserDTO dto) {
        Patient newPatient = new Patient();
        Optional<User> user = userRepository.findByUserName(dto.getUsername());
        user.ifPresent(newPatient::setUser);
        newPatient.setPatientIdentifier(sequenceGenerator.getNextPatientIdentifier());
        patientRepository.save(newPatient);
    }

    @Override
    public Patient getPatient(User user) {
        return patientRepository.findByUser(user);
    }

    @Override
    public Optional<Patient> findById(Long id) {
        return patientRepository.findById(id);
    }

    @Override
    @Transactional
    public List<PatientDropDownDTO> getAllPatientsForDropdown() {
        return patientRepository.findAll().stream()
                .map(patient -> {
                    PatientDropDownDTO dto = new PatientDropDownDTO();
                    dto.setUserId(patient.getUser().getId());
                    dto.setFullName(patient.getUser().getFullName());
                    dto.setEmail(patient.getUser().getEmail());
                    return dto;
                })
                .toList();
    }
}
