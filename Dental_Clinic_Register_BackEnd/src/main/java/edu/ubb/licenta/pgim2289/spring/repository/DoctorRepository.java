package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Doctor findByUser(User user);

    List<Doctor> findByServices_Id(Long serviceId);

    Optional<Doctor> findByUser_Id(Long userId);


}
