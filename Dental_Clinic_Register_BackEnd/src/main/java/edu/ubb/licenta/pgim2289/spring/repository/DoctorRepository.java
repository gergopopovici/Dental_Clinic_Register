package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.data.jpa.repository.JpaRepository;



public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Doctor findByUser(User user);
}
