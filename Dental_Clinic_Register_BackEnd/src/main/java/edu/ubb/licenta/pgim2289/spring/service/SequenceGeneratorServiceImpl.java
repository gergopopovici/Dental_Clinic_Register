package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.Sequence;
import edu.ubb.licenta.pgim2289.spring.repository.SequenceRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class SequenceGeneratorServiceImpl implements SequenceGeneratorService {
    private final SequenceRepository sequenceRepository;
    private static final String PATIENT_SEQUENCE_NAME = "patient_id_sequence";
    private static final String PATIENT_ID_PREFIX = "P-";
    private static final int ID_NUMBER_LENGTH = 5;

    public SequenceGeneratorServiceImpl(SequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    @Transactional
    @Override
    public String getNextPatientIdentifier() {
        Sequence patientSequence = sequenceRepository
                .findBySequenceName(PATIENT_SEQUENCE_NAME);
        Long nextNumber = patientSequence.getNextValue();
        patientSequence.setNextValue(nextNumber + 1);
        sequenceRepository.save(patientSequence);
        String formattedNumber = String.format("%0" + ID_NUMBER_LENGTH
                + "d", nextNumber);
        return PATIENT_ID_PREFIX + formattedNumber;

    }

    @Override
    public void initializePatientSequence() {
        if (sequenceRepository.findBySequenceName(PATIENT_SEQUENCE_NAME) == null) {
            Sequence patientSequence = new Sequence();
            patientSequence.setSequenceName(PATIENT_SEQUENCE_NAME);
            patientSequence.setNextValue(1L);
            sequenceRepository.save(patientSequence);
        }
    }
}
