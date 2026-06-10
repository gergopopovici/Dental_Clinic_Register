package edu.ubb.licenta.pgim2289.spring.mapper;

import edu.ubb.licenta.pgim2289.spring.dto.ClinicSettingsDTO;
import edu.ubb.licenta.pgim2289.spring.model.ClinicSettings;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClinicSettingsMapper {
    ClinicSettingsDTO toDto(ClinicSettings clinicSettings);
    ClinicSettings toEntity(ClinicSettingsDTO dto);
}
