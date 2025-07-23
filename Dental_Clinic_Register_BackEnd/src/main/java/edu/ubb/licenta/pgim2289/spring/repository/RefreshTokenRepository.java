package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.RefreshToken;
import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    void deleteByUser(User user);

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserId(Long userId);
}
