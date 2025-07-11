package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    @Query(value = "SELECT * FROM verification_code "
            + "WHERE user_id = :userId AND code = :code AND purpose = :purpose "
            + "AND used = false LIMIT 1", nativeQuery = true)
    Optional<VerificationCode> findValidCode(Long userId, String code, String purpose);

}
