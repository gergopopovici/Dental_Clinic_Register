package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.DoctorScheduleDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.TimeOffDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ScheduleService {
    List<DoctorScheduleDTO> getDoctorSchedule(Long doctorId);

    ResponseEntity<MessageResponse> updateDoctorSchedule(Long doctorId, List<DoctorScheduleDTO> schedules);

    List<TimeOffDTO> getDoctorTimeOffs(Long doctorId);

    ResponseEntity<MessageResponse> addTimeOff(TimeOffDTO timeOffDTO);

    ResponseEntity<MessageResponse> deleteTimeOff(Long timeOffId);

    List<TimeOffDTO> getGlobalHolidays();
}
