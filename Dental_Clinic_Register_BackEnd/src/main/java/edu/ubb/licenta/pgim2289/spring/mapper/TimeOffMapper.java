package edu.ubb.licenta.pgim2289.spring.mapper;

import edu.ubb.licenta.pgim2289.spring.dto.TimeOffDTO;
import edu.ubb.licenta.pgim2289.spring.model.TimeOff;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TimeOffMapper {

    @Mapping(source = "doctor.id", target = "doctorId")
    TimeOffDTO toDto(TimeOff timeOff);
}
