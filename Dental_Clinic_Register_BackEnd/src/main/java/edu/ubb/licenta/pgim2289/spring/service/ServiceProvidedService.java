package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestServiceDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseServiceDTO;
import edu.ubb.licenta.pgim2289.spring.model.ServiceProvided;

import java.util.List;
import java.util.Optional;

public interface ServiceProvidedService {
    ResponseServiceDTO createService(RequestServiceDTO request);

    ResponseServiceDTO updateService(Long id, RequestServiceDTO request);

    void deleteService(Long id);

    List<ResponseServiceDTO> getAllServices();

    ResponseServiceDTO findServiceById(Long id);

    Optional<ServiceProvided> findById(Long id);

}
