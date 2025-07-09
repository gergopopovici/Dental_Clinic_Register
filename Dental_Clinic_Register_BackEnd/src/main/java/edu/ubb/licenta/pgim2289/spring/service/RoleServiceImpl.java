package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.Role;
import edu.ubb.licenta.pgim2289.spring.repository.RoleRepository;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Named("mapRolesToRoleNames")
    @Override
    public Set<String> mapRolesToRoleNames(Set<Role> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return Collections.emptySet();
        } else {
            return roleNames.stream()
                    .map(role -> role.getRoleName().name())
                    .collect(Collectors.toSet());
        }
    }

    @Named("mapRoleNamesToRoles")
    @Override
    public Set<Role> mapRoleNamesToRoles(Set<String> roleNames) {
        if (roleNames == null || roleNames.isEmpty()) {
            return Collections.emptySet();
        }
        return roleNames.stream()
                .map(Role.RoleName::valueOf)
                .map(roleRepository::findByRoleName)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
    }
}


