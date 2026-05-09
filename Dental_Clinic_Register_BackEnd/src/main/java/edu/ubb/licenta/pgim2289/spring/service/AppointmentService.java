package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestAppointmentDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseAppointmentDTO;
import edu.ubb.licenta.pgim2289.spring.model.Appointment.AppointmentStatus;

import java.util.List;

public interface AppointmentService {
    List<ResponseAppointmentDTO> getPatientAppointments(Long userId);

    List<ResponseAppointmentDTO> getDoctorAppointments(Long userId);

    ResponseAppointmentDTO createAppointment(RequestAppointmentDTO request);

    ResponseAppointmentDTO updateAppointment(Long id, RequestAppointmentDTO request);

    ResponseAppointmentDTO updateAppointmentStatus(Long id, AppointmentStatus status);
}
