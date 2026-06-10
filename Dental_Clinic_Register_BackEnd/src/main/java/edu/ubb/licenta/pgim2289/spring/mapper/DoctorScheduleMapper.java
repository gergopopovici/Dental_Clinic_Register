package edu.ubb.licenta.pgim2289.spring.mapper;

import edu.ubb.licenta.pgim2289.spring.dto.DoctorScheduleDTO;
import edu.ubb.licenta.pgim2289.spring.model.DoctorSchedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorScheduleMapper {

    @Mapping(source = "doctor.id", target = "doctorId")
    DoctorScheduleDTO toDto(DoctorSchedule schedule);
}
