package edu.ubb.licenta.pgim2289.spring.mapper;

import edu.ubb.licenta.pgim2289.spring.dto.RequestServiceDTO;
import edu.ubb.licenta.pgim2289.spring.dto.ResponseServiceDTO;
import edu.ubb.licenta.pgim2289.spring.model.ServiceProvided;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ServiceProvidedMapper {
    ServiceProvided toEntity(RequestServiceDTO requestServiceDTO);

    ResponseServiceDTO toDTO(ServiceProvided service);
}
