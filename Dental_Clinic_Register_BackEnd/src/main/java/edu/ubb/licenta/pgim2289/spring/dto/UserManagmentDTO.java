package edu.ubb.licenta.pgim2289.spring.dto;

public record UserManagmentDTO(Long id,
                               String userName,
                               String name,
                               String email,
                               String role,
                               boolean enabled) {
}
