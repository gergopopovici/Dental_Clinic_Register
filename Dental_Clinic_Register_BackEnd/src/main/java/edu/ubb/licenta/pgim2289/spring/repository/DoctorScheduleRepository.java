package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {
    List<DoctorSchedule> findAllByDoctorId(Long doctorId);

    Optional<DoctorSchedule> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);
}
