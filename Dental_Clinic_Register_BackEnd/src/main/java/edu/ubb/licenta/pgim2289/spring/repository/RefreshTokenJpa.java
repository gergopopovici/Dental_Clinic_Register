package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;

public interface RefreshTokenJpa extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    // int deleteByUser(User user);

    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
}
