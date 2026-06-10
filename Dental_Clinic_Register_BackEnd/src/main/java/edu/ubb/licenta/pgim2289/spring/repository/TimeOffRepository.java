package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.TimeOff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeOffRepository extends JpaRepository<TimeOff, Long> {
    List<TimeOff> findAllByDoctorId(Long doctorId);

    List<TimeOff> findAllByDoctorIsNull();

    @Query("SELECT t FROM TimeOff  t WHERE (t.doctor.id = : doctorId or t.doctor is NULL)"
            + "AND :date BETWEEN t.startDate and t.endDate")
    List<TimeOff> findOverlappingTimeOffs(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}
