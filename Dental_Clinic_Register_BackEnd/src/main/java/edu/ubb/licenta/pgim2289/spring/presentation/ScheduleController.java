package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.dto.DoctorScheduleDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.TimeOffDTO;
import edu.ubb.licenta.pgim2289.spring.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {
    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorScheduleDTO>> getDoctorSchedule(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getDoctorSchedule(doctorId));
    }

    @PutMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<MessageResponse> updateDoctorSchedule(
            @PathVariable Long doctorId,
            @RequestBody List<DoctorScheduleDTO> schedules) {
        return scheduleService.updateDoctorSchedule(doctorId, schedules);
    }

    @GetMapping("/time-off/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<TimeOffDTO>> getDoctorTimeOffs(@PathVariable Long doctorId) {
        return ResponseEntity.ok(scheduleService.getDoctorTimeOffs(doctorId));
    }

    @PostMapping("/time-off/doctor")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<MessageResponse> addDoctorTimeOff(@RequestBody TimeOffDTO timeOffDTO) {
        if (timeOffDTO.getDoctorId() == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("doctor.id.required"));
        }
        return scheduleService.addTimeOff(timeOffDTO);
    }

    @GetMapping("/time-off/global")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<List<TimeOffDTO>> getGlobalHolidays() {
        return ResponseEntity.ok(scheduleService.getGlobalHolidays());
    }

    @PostMapping("/time-off/global")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> addGlobalHoliday(@RequestBody TimeOffDTO timeOffDTO) {
        timeOffDTO.setDoctorId(null);
        return scheduleService.addTimeOff(timeOffDTO);
    }

    @DeleteMapping("/time-off/{timeOffId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<MessageResponse> deleteTimeOff(@PathVariable Long timeOffId) {
        return scheduleService.deleteTimeOff(timeOffId);
    }
}
