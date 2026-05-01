package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestUserDTO;
import edu.ubb.licenta.pgim2289.spring.model.Doctor;
import edu.ubb.licenta.pgim2289.spring.model.User;

public interface DoctorService {
    void createDoctor(User user,RequestUserDTO requestUserDTO);
    Doctor getDoctor(User user);
}
