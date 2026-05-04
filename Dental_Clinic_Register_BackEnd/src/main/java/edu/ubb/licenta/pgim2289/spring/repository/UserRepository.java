package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.Role;
import edu.ubb.licenta.pgim2289.spring.model.User;
import jakarta.validation.constraints.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    // Integer phoneNumber(String phoneNumber);

    Optional<User> findByUserName(String userName);

    User findByEmail(@Email String email);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.roleName = 2")
    long countPatients();

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.roleName = 1")
    long countDoctors();

    long countByEnabledFalse();

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsers(@Param("keyword") String keyword);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.roleName = :role AND u.enabled = true")
    long countActiveAdmins(@Param("role") Role.RoleName role);
}
