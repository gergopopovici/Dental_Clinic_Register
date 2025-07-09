package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.Role;

import java.util.Set;

public interface RoleService {
    Set<String> mapRolesToRoleNames(Set<Role> roles);

    Set<Role> mapRoleNamesToRoles(Set<String> roleNames);
}
