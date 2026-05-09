package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.RequestServiceDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseServiceDTO;
import edu.ubb.licenta.pgim2289.spring.mapper.ServiceProvidedMapper;
import edu.ubb.licenta.pgim2289.spring.model.ServiceProvided;
import edu.ubb.licenta.pgim2289.spring.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceProvidedServiceImpl implements ServiceProvidedService {
    private final ServiceRepository serviceRepository;
    private final ServiceProvidedMapper mapper;

    public ServiceProvidedServiceImpl(ServiceRepository serviceRepository, ServiceProvidedMapper mapper) {
        this.serviceRepository = serviceRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public ResponseServiceDTO createService(RequestServiceDTO request) {
        ServiceProvided serviceProvided = mapper.toEntity(request);
        return mapper.toDTO(serviceRepository.save(serviceProvided));
    }

    @Override
    public ResponseServiceDTO updateService(Long id, RequestServiceDTO request) {
        ServiceProvided serviceProvided = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("error.service_not_found"));
        serviceProvided.setName(request.getName());
        serviceProvided.setPrice(request.getPrice());
        serviceProvided.setDescription(request.getDescription());
        serviceProvided.setDurationMinutes(request.getDurationMinutes());
        return mapper.toDTO(serviceRepository.save(serviceProvided));
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new IllegalArgumentException("error.service_not_found");
        }
        serviceRepository.deleteById(id);
    }

    @Override
    public List<ResponseServiceDTO> getAllServices() {
        return serviceRepository.findAll().stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public ResponseServiceDTO findServiceById(Long id) {
        ServiceProvided serviceProvided = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("error.service_not_found"));
        return mapper.toDTO(serviceProvided);
    }
}
