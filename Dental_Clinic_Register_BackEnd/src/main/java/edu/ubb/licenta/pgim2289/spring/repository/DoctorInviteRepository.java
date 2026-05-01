package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.DoctorInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorInviteRepository extends JpaRepository<DoctorInvite, Long> {
    Optional<DoctorInvite> findByToken(String token);

    void deleteByEmail(String email);

    Optional<DoctorInvite> findByEmail(String email);
}
