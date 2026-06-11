package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_User_Id(Long userId);

    List<Appointment> findByDoctor_User_Id(Long userId);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.status = 'CONFIRMED' " +
            "AND (a.startTime < :endTime AND a.endTime > :startTime)")
    long countOverlappingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    List<Appointment> findByPatient_User_IdOrderByStartTimeDesc(Long userId);

    List<Appointment> findByDoctor_IdAndStartTimeBetween(Long doctorId, LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.user.id = :userId AND " +
            "a.startTime >= :startOfDay AND a.startTime <= :endOfDay " +
            "ORDER BY a.startTime ASC")
    List<Appointment> findDoctorDailyAppointments(
            @Param("userId") Long userId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.id != :excludeAppointmentId " +
            "AND a.status = 'CONFIRMED' " +
            "AND (a.startTime < :endTime AND a.endTime > :startTime)")
    long countOverlappingAppointmentsExcluding(
            @Param("doctorId") Long doctorId,
            @Param("excludeAppointmentId") Long excludeAppointmentId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    List<Appointment> findByStatusAndStartTimeBetweenAndReminderDaySentFalse(
            Appointment.AppointmentStatus status, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByStatusAndStartTimeBetweenAndReminderHourSentFalse(
            Appointment.AppointmentStatus status, LocalDateTime start, LocalDateTime end);
}