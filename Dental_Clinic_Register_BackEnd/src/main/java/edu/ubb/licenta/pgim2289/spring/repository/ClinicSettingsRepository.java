package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.ClinicSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Long> {
    Optional<ClinicSettings> findTopByOrderByIdAsc();
}
