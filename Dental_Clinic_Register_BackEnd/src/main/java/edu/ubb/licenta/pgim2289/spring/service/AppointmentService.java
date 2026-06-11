package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    List<BookedSlotDTO> getBookedSlotsForDoctor(Long doctorId, LocalDate date);

    ResponseAppointmentDTO requestAppointment(Long userId, RequestPatientAppointmentDTO request);

    ResponseAppointmentDTO createAppointmentByDoctor(Long userId, DoctorCreateAppointmentDTO request);

    ResponseAppointmentDTO updateAppointment(Long appointmentId, Long userId, DoctorUpdateAppointmentDTO request);

    ResponseAppointmentDTO cancelAppointmentByPatient(Long appointmentId, Long userId);

    ResponseAppointmentDTO cancelAppointmentByDoctor(Long appointmentId, Long userId, String reason);

    ResponseAppointmentDTO markAsNoShow(Long appointmentId, Long userId);

    ResponseAppointmentDTO markAsCompleted(Long appointmentId, Long userId);

    List<ResponseAppointmentDTO> getAppointmentsByPatient(Long userId);

    List<ResponseAppointmentDTO> getDailyAppointmentsForDoctor(Long userId, LocalDate date);
}