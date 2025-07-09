package edu.ubb.licenta.pgim2289.spring.service;

public interface SequenceGeneratorService {
    String getNextPatientIdentifier();

    void initializePatientSequence();
}
