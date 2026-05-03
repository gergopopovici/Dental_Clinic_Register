package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.AdminInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminInviteRepository extends JpaRepository<AdminInvite,Long> {
    Optional<AdminInvite> findByToken(String token);
    void deleteByEmail(String email);
    Optional<AdminInvite> findByEmail(String email);
}
