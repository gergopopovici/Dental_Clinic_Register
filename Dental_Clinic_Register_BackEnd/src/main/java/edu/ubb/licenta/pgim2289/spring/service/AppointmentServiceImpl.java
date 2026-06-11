package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.mapper.AppointmentMapper;
import edu.ubb.licenta.pgim2289.spring.model.*;
import edu.ubb.licenta.pgim2289.spring.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final ServiceProvidedService serviceProvidedService;
    private final AppointmentMapper appointmentMapper;
    private final EmailService emailService;
    private final UserService userService;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, PatientService patientService, DoctorService doctorService, ServiceProvidedService serviceProvidedService, AppointmentMapper appointmentMapper, EmailService emailService, UserService userService) {
        this.appointmentRepository = appointmentRepository;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.serviceProvidedService = serviceProvidedService;
        this.appointmentMapper = appointmentMapper;
        this.emailService = emailService;
        this.userService = userService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookedSlotDTO> getBookedSlotsForDoctor(Long userId, LocalDate date) {
        Doctor doctor = doctorService.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("doctor.not.found"));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return appointmentRepository.findByDoctor_IdAndStartTimeBetween(doctor.getId(), startOfDay, endOfDay)
                .stream()
                .filter(appt -> appt.getStatus() == Appointment.AppointmentStatus.CONFIRMED)
                .map(appt -> new BookedSlotDTO(appt.getStartTime(), appt.getEndTime()))
                .toList();
    }

    @Override
    @Transactional
    public ResponseAppointmentDTO requestAppointment(Long userId, RequestPatientAppointmentDTO request) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("error.user.not.found"));
        Patient patient = user.getPatientDetails();

        Doctor doctor = doctorService.findByUserId(request.getDoctorId()).orElseThrow(() -> new IllegalArgumentException("error.doctor.not.found"));
        ServiceProvided service = serviceProvidedService.findById(request.getServiceId()).orElseThrow(() -> new IllegalArgumentException("error.service.not.found"));

        LocalDateTime exactStartTime = request.getStartTime();
        LocalDateTime exactEndTime = exactStartTime.plusMinutes(service.getDurationMinutes());

        long overlapping = appointmentRepository.countOverlappingAppointments(doctor.getId(), exactStartTime, exactEndTime);
        if (overlapping > 0) {
            throw new IllegalArgumentException("error.doctor.already.booked");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setService(service);
        appointment.setStartTime(exactStartTime);
        appointment.setEndTime(exactEndTime);
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        emailService.sendConfirmationEmailToPatient(patient.getUser().getEmail(), patient.getUser().getFullName(), exactStartTime, doctor.getUser().getFullName());
        return appointmentMapper.toDto(savedAppointment);
    }

    @Override
    @Transactional
    public ResponseAppointmentDTO createAppointmentByDoctor(Long userId, DoctorCreateAppointmentDTO request) {
        User user = userService.findById(userId).orElseThrow(() -> new IllegalArgumentException("error.user.not.found"));
        Doctor doctor = user.getDoctorDetails();

        Patient patient = patientService.findByUserId(request.getPatientId()).orElseThrow(() -> new IllegalArgumentException("error.patient.not.found"));
        ServiceProvided service = serviceProvidedService.findById(request.getServiceId()).orElseThrow(() -> new IllegalArgumentException("error.service.not.found"));

        LocalDateTime exactStartTime = request.getStartTime();
        LocalDateTime exactEndTime = exactStartTime.plusMinutes(service.getDurationMinutes());

        long overlapping = appointmentRepository.countOverlappingAppointments(doctor.getId(), exactStartTime, exactEndTime);
        if (overlapping > 0) {
            throw new IllegalArgumentException("error.doctor.already.booked");
        }

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setService(service);
        appointment.setStartTime(exactStartTime);
        appointment.setEndTime(exactEndTime);
        appointment.setNotes(request.getNotes());
        appointment.setResourceLink(request.getResourceLink());
        appointment.setStatus(Appointment.AppointmentStatus.CONFIRMED);

        Appointment savedAppointment = appointmentRepository.save(appointment);
        emailService.sendNewAppointmentCreatedEmailToPatient(patient.getUser().getEmail(), patient.getUser().getFullName(), exactStartTime, doctor.getUser().getFullName());
        return appointmentMapper.toDto(savedAppointment);
    }

    @Override
    @Transactional
    public ResponseAppointmentDTO updateAppointment(Long appointmentId, Long userId, DoctorUpdateAppointmentDTO request) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new IllegalArgumentException("error.appointment.not.found"));

        if (!appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new SecurityException("error.unauthorised.action");
        }

        LocalDateTime newStartTime = request.getNewStartTime();
        LocalDateTime newEndTime = newStartTime.plusMinutes(appointment.getService().getDurationMinutes());

        long overlapping = appointmentRepository.countOverlappingAppointmentsExcluding(
                appointment.getDoctor().getId(),
                appointmentId,
                newStartTime,
                newEndTime
        );
        if (overlapping > 0) {
            throw new IllegalArgumentException("error.doctor.already.booked");
        }

        appointment.setStartTime(newStartTime);
        appointment.setNotes(request.getNotes());
        appointment.setResourceLink(request.getResourceLink());
        appointment.setEndTime(newEndTime);

        emailService.sendAppointmentUpdatedEmailToPatient(appointment.getPatient().getUser().getEmail(), appointment.getPatient().getUser().getFullName(), newStartTime, appointment.getDoctor().getUser().getFullName());
        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public ResponseAppointmentDTO cancelAppointmentByPatient(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("error.appointment.not.found"));

        if (!appointment.getPatient().getUser().getId().equals(userId)) {
            throw new SecurityException("error.unauthorised.action");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        String dateInfo = appointment.getStartTime().toString().replace("T", " ");

        emailService.sendAppointmentCancelledByPatientEmailToDoctor(
                appointment.getDoctor().getUser().getEmail(),
                appointment.getDoctor().getUser().getFullName(),
                appointment.getPatient().getUser().getFullName(),
                dateInfo
        );

        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public ResponseAppointmentDTO cancelAppointmentByDoctor(Long appointmentId, Long userId, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("error.appointment.not.found"));

        if (!appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new SecurityException("error.unauthorised.action");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setNotes(appointment.getNotes() != null
                ? appointment.getNotes() + " | Cancel reason: " + reason
                : "Cancel reason: " + reason);

        String dateInfo = appointment.getStartTime().toString().replace("T", " ");

        emailService.sendAppointmentCancelledByDoctorEmailToPatient(
                appointment.getPatient().getUser().getEmail(),
                appointment.getPatient().getUser().getFullName(),
                appointment.getDoctor().getUser().getFullName(),
                dateInfo,
                reason
        );

        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public ResponseAppointmentDTO markAsNoShow(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new IllegalArgumentException("error.appointment.not.found"));

        if (!appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new SecurityException("error.unauthorised.action");
        }

        appointment.setStatus(Appointment.AppointmentStatus.NO_SHOW);
        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public ResponseAppointmentDTO markAsCompleted(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new IllegalArgumentException("error.appointment.not.found"));

        if (!appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new SecurityException("error.unauthorised.action");
        }

        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        emailService.sendPostVisitThankYouEmail(appointment.getPatient().getUser().getEmail(), appointment.getPatient().getUser().getFullName(), appointment.getDoctor().getUser().getFullName());
        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponseAppointmentDTO> getAppointmentsByPatient(Long userId) {
        return appointmentRepository.findByPatient_User_IdOrderByStartTimeDesc(userId)
                .stream().map(appointmentMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponseAppointmentDTO> getDailyAppointmentsForDoctor(Long userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return appointmentRepository.findDoctorDailyAppointments(userId, startOfDay, endOfDay)
                .stream().map(appointmentMapper::toDto)
                .toList();
    }
}