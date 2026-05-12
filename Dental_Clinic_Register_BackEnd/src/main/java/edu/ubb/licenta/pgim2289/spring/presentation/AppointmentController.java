package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/patient/{userId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<ResponseAppointmentDTO>> getPatientAppointments(
            @PathVariable Long userId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(userId));
    }

    @GetMapping("/doctor/{userId}/daily")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<ResponseAppointmentDTO>> getDoctorDailyAppointments(@PathVariable Long userId,
                                                                                   @RequestParam(required = false)
                                                                                   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                                                                   LocalDate date) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(appointmentService.getDailyAppointmentsForDoctor(userId, queryDate));
    }

    @PostMapping("/patient/{userId}/request")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ResponseAppointmentDTO> requestAppointment(
            @PathVariable Long userId,
            @Valid @RequestBody RequestPatientAppointmentDTO requestPatientAppointmentDTO) {

        return ResponseEntity.ok(appointmentService.requestAppointment(userId, requestPatientAppointmentDTO));
    }

    @PutMapping("/patient/{userId}/cancel/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ResponseAppointmentDTO> cancelAppointmentByPatient(
            @PathVariable Long userId,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByPatient(appointmentId, userId));
    }

    @PostMapping("/doctor/{userId}/create")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseAppointmentDTO> createAppointmentByDoctor(
            @PathVariable Long userId,
            @Valid @RequestBody DoctorCreateAppointmentDTO request) {
        return ResponseEntity.ok(appointmentService.createAppointmentByDoctor(userId, request));
    }

    @PostMapping("/doctor/{userId}/confirm/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseAppointmentDTO> confirmAppointment(
            @PathVariable Long userId,
            @PathVariable Long appointmentId,
            @Valid @RequestBody DoctorConfirmDTO request) {
        return ResponseEntity.ok(appointmentService.confirmAppointment(appointmentId, userId, request));
    }

    @PutMapping("/doctor/{userId}/update/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseAppointmentDTO> updateAppointment(
            @PathVariable Long userId,
            @PathVariable Long appointmentId,
            @Valid @RequestBody DoctorUpdateAppointmentDTO request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, userId, request));
    }

    @PutMapping("/doctor/{userId}/cancel/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseAppointmentDTO> cancelAppointmentByDoctor(
            @PathVariable Long userId,
            @PathVariable Long appointmentId,
            @RequestParam String reason) {

        return ResponseEntity.ok(appointmentService.cancelAppointmentByDoctor(appointmentId, userId, reason));
    }

    @PutMapping("/doctor/{userId}/no-show/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseAppointmentDTO> markAsNoShow(
            @PathVariable Long userId,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.markAsNoShow(appointmentId, userId));
    }

    @PutMapping("/doctor/{userId}/complete/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ResponseAppointmentDTO> markAsCompleted(
            @PathVariable Long userId,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.markAsCompleted(appointmentId, userId));
    }

}
