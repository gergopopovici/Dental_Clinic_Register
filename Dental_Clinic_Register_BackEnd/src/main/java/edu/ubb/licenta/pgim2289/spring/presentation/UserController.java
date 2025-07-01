package edu.ubb.licenta.pgim2289.spring.presentation;

import edu.ubb.licenta.pgim2289.spring.service.UserService;
import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseUserDTO;
import edu.ubb.licenta.pgim2289.spring.mapper.UserMapper;
import edu.ubb.licenta.pgim2289.spring.model.User;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.InvalidParameterException;
import java.util.Collection;

@RestController
@RequestMapping("/api/users")
@Slf4j
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class UserController {
    private final UserService userService;
    @Autowired
    private final UserMapper userMapper;

    @Autowired
    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseUserDTO createUser(@RequestBody @Valid RequestUserDTO user) throws InvalidParameterException {
        log.info("Creating user: {}", user);
        User newUser = userMapper.toEntity(user);
        log.info("User created: " + newUser);
        userService.createUser(newUser);
        log.info("User created: " + newUser);
        return userMapper.toDTO(newUser);
    }

    @GetMapping
    public Collection<ResponseUserDTO> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(userMapper::toDTO)
                .toList();
    }
}
