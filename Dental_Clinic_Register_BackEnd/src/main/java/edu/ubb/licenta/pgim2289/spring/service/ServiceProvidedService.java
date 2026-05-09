package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestServiceDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseServiceDTO;

import java.util.List;

public interface ServiceProvidedService {
    ResponseServiceDTO createService(RequestServiceDTO request);
    ResponseServiceDTO updateService(Long id, RequestServiceDTO request);
    void deleteService(Long id);
    List<ResponseServiceDTO> getAllServices();
    ResponseServiceDTO findServiceById(Long id);

}
