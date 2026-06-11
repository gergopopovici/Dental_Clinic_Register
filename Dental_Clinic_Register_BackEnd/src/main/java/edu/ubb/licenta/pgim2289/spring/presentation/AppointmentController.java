package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.*;
import edu.ubb.licenta.pgim2289.spring.service.AppointmentService;
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

    @GetMapping("/doctor/{doctorId}/booked-slots")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<BookedSlotDTO>> getBookedSlots(
            @PathVariable Long doctorId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getBookedSlotsForDoctor(doctorId, date));
    }

    @PostMapping("/patient/{userId}/request")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ResponseAppointmentDTO> requestAppointment(
            @PathVariable Long userId,
            @RequestBody RequestPatientAppointmentDTO request) {
        return ResponseEntity.ok(appointmentService.requestAppointment(userId, request));
    }

    @PostMapping("/doctor/{userId}/create")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ResponseAppointmentDTO> createAppointmentByDoctor(
            @PathVariable Long userId,
            @RequestBody DoctorCreateAppointmentDTO request) {
        return ResponseEntity.ok(appointmentService.createAppointmentByDoctor(userId, request));
    }

    @PutMapping("/doctor/{userId}/update/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ResponseAppointmentDTO> updateAppointment(
            @PathVariable Long userId,
            @PathVariable Long appointmentId,
            @RequestBody DoctorUpdateAppointmentDTO request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, userId, request));
    }

    @PutMapping("/patient/{userId}/cancel/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ResponseAppointmentDTO> cancelAppointmentByPatient(
            @PathVariable Long userId,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByPatient(appointmentId, userId));
    }

    @PutMapping("/doctor/{userId}/cancel/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ResponseAppointmentDTO> cancelAppointmentByDoctor(
            @PathVariable Long userId,
            @PathVariable Long appointmentId,
            @RequestParam("reason") String reason) {
        return ResponseEntity.ok(appointmentService.cancelAppointmentByDoctor(appointmentId, userId, reason));
    }

    @PutMapping("/doctor/{userId}/no-show/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ResponseAppointmentDTO> markAsNoShow(
            @PathVariable Long userId,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.markAsNoShow(appointmentId, userId));
    }

    @PutMapping("/doctor/{userId}/complete/{appointmentId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ResponseAppointmentDTO> markAsCompleted(
            @PathVariable Long userId,
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.markAsCompleted(appointmentId, userId));
    }

    @GetMapping("/patient/{userId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<List<ResponseAppointmentDTO>> getAppointmentsByPatient(@PathVariable Long userId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(userId));
    }

    @GetMapping("/doctor/{userId}/daily")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<List<ResponseAppointmentDTO>> getDailyAppointmentsForDoctor(
            @PathVariable Long userId,
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(appointmentService.getDailyAppointmentsForDoctor(userId, targetDate));
    }
}