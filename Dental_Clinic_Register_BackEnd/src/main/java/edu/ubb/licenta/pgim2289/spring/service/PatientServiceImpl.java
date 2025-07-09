package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Patient;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.PatientRepository;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import org.springframework.stereotype.Service;

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
        newPatient.setPatientBirthDate(dto.getDateOfBirth());
        Optional<User> user = userRepository.findByUserName(dto.getUsername());
        user.ifPresent(newPatient::setUser);
        newPatient.setPatientIdentifier(sequenceGenerator.getNextPatientIdentifier());
        newPatient.setGender(dto.getGender());
        patientRepository.save(newPatient);
    }
}
