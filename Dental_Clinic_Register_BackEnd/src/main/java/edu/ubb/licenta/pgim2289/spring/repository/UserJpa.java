package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserJpa extends JpaRepository<User, Long> {

    boolean existsByUserName(String userName);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);

    Integer phoneNumber(String phoneNumber);
}
