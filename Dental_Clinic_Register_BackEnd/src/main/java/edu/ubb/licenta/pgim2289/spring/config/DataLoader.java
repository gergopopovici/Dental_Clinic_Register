package edu.ubb.licenta.pgim2289.spring.config;

import edu.ubb.licenta.pgim2289.spring.model.Role;
import edu.ubb.licenta.pgim2289.spring.repository.RoleRepository;
import edu.ubb.licenta.pgim2289.spring.service.SequenceGeneratorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@Slf4j
public class DataLoader {

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository,
                                       SequenceGeneratorService sequenceGeneratorService) {
        return args -> {
            if (roleRepository.count() == 0) {
                Arrays.stream(Role.RoleName.values()).forEach(roleName -> {
                    Role role = new Role();
                    role.setRoleName(roleName);
                    roleRepository.save(role);
                    log.info("Created role: {}", roleName.name());
                });
            }
            sequenceGeneratorService.initializePatientSequence();
            log.info("Initialized sequence generator");
        };
    }
}