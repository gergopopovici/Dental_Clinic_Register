package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestAppointmentDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseAppointmentDTO;
import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import edu.ubb.licenta.pgim2289.spring.repository.AppointmentRepository;
import edu.ubb.licenta.pgim2289.spring.repository.DoctorRepository;
import edu.ubb.licenta.pgim2289.spring.repository.PatientRepository;

import java.util.List;

public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, DoctorRepository doctorRepository, PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public List<ResponseAppointmentDTO> getPatientAppointments(Long userId) {
        return List.of();
    }

    @Override
    public List<ResponseAppointmentDTO> getDoctorAppointments(Long userId) {
        return List.of();
    }

    @Override
    public ResponseAppointmentDTO createAppointment(RequestAppointmentDTO request) {
        return null;
    }

    @Override
    public ResponseAppointmentDTO updateAppointment(Long id, RequestAppointmentDTO request) {
        return null;
    }

    @Override
    public ResponseAppointmentDTO updateAppointmentStatus(Long id, Appointment.AppointmentStatus status) {
        return null;
    }
}
