package edu.ubb.licenta.pgim2289.spring.service;


import edu.ubb.licenta.pgim2289.spring.dto.DoctorScheduleDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.dto.TimeOffDTO;
import edu.ubb.licenta.pgim2289.spring.mapper.DoctorScheduleMapper;
import edu.ubb.licenta.pgim2289.spring.mapper.TimeOffMapper;
import edu.ubb.licenta.pgim2289.spring.model.ClinicSettings;
import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.DoctorSchedule;
import edu.ubb.licenta.pgim2289.spring.model.TimeOff;
import edu.ubb.licenta.pgim2289.spring.repository.ClinicSettingsRepository;
import edu.ubb.licenta.pgim2289.spring.repository.DoctorRepository;
import edu.ubb.licenta.pgim2289.spring.repository.DoctorScheduleRepository;
import edu.ubb.licenta.pgim2289.spring.repository.TimeOffRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final TimeOffRepository timeOffRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleMapper doctorScheduleMapper;
    private final TimeOffMapper timeOffMapper;
    private final ClinicSettingsRepository clinicSettingsRepository;

    public ScheduleServiceImpl(DoctorScheduleRepository scheduleRepository,
                               DoctorRepository doctorRepository, TimeOffRepository timeOffRepository, DoctorScheduleMapper doctorScheduleMapper, TimeOffMapper timeOffMapper, ClinicSettingsRepository clinicSettingsRepository) {
        this.scheduleRepository = scheduleRepository;
        this.doctorRepository = doctorRepository;
        this.timeOffRepository = timeOffRepository;
        this.doctorScheduleMapper = doctorScheduleMapper;
        this.timeOffMapper = timeOffMapper;
        this.clinicSettingsRepository = clinicSettingsRepository;
    }

    @Override
    public List<DoctorScheduleDTO> getDoctorSchedule(Long userId) {
        Doctor doctor = doctorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("doctor.not.found"));
        List<DoctorSchedule> existing = scheduleRepository.findAllByDoctorId(doctor.getId()); // ← doctor.getId()
        ClinicSettings settings = clinicSettingsRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("clinic.settings.not.found"));

        return Arrays.stream(DayOfWeek.values())
                .map(day -> existing.stream()
                        .filter(s -> s.getDayOfWeek() == day)
                        .findFirst()
                        .map(doctorScheduleMapper::toDto)
                        .orElseGet(() -> {
                            DoctorScheduleDTO dto = new DoctorScheduleDTO();
                            dto.setDoctorId(userId);
                            dto.setDayOfWeek(day.name());
                            dto.setStartTime(settings.getDefaultStartTime());
                            dto.setEndTime(settings.getDefaultEndTime());
                            dto.setIsWorking(false);
                            return dto;
                        }))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResponseEntity<MessageResponse> updateDoctorSchedule(Long userId, List<DoctorScheduleDTO> schedules) {
        Doctor doctor = doctorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("doctor.not.found"));
        for (DoctorScheduleDTO dto : schedules) {
            DoctorSchedule schedule = scheduleRepository.findByDoctorIdAndDayOfWeek(doctor.getId(),
                            DayOfWeek.valueOf(dto.getDayOfWeek()))
                    .orElse(new DoctorSchedule());
            schedule.setDoctor(doctor);
            schedule.setDayOfWeek(DayOfWeek.valueOf(dto.getDayOfWeek()));
            schedule.setStartTime(dto.getStartTime());
            schedule.setEndTime(dto.getEndTime());
            schedule.setIsWorking(dto.getIsWorking());
            scheduleRepository.save(schedule);
        }
        return ResponseEntity.ok(new MessageResponse("schedule.updated.successfully"));
    }

    @Override
    public List<TimeOffDTO> getDoctorTimeOffs(Long userId) {
        Doctor doctor = doctorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("doctor.not.found"));
        return timeOffRepository.findAllByDoctorId(doctor.getId()).stream()
                .map(timeOffMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResponseEntity<MessageResponse> addTimeOff(TimeOffDTO timeOffDTO) {
        TimeOff timeOff = new TimeOff();
        if (timeOffDTO.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findByUser_Id(timeOffDTO.getDoctorId())
                    .orElseThrow(() -> new RuntimeException("doctor.not.found"));
            timeOff.setDoctor(doctor);
        }

        timeOff.setStartDate(timeOffDTO.getStartDate());
        timeOff.setEndDate(timeOffDTO.getEndDate());
        timeOff.setReason(timeOffDTO.getReason());

        timeOffRepository.save(timeOff);
        return ResponseEntity.ok(new MessageResponse("time.off.added.successfully"));
    }

    @Override
    @Transactional
    public ResponseEntity<MessageResponse> deleteTimeOff(Long timeOffId) {
        timeOffRepository.deleteById(timeOffId);
        return ResponseEntity.ok(new MessageResponse("time.off.deleted.successfully"));
    }

    @Override
    public List<TimeOffDTO> getGlobalHolidays() {
        return timeOffRepository.findAllByDoctorIsNull().stream()
                .map(timeOffMapper::toDto)
                .collect(Collectors.toList());
    }
}
