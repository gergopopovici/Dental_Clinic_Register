package edu.ubb.licenta.pgim2289.spring.mapper;

import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseUserDTO;
import edu.ubb.licenta.pgim2289.spring.service.RoleService;
import org.mapstruct.Mapper;

import edu.ubb.licenta.pgim2289.spring.model.User;

@Mapper(componentModel = "spring", uses = {RoleService.class})
public interface UserMapper {
    User toEntity(RequestUserDTO requestUserDTO);

    ResponseUserDTO toDTO(User user);
}
