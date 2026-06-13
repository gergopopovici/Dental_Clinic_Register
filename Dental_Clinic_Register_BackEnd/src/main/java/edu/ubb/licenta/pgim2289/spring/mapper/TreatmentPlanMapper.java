package edu.ubb.licenta.pgim2289.spring.mapper;

import edu.ubb.licenta.pgim2289.spring.dto.PlanAppointmentDTO;
import edu.ubb.licenta.pgim2289.spring.dto.TreatmentPlanDTO;
import edu.ubb.licenta.pgim2289.spring.model.Appointment;
import edu.ubb.licenta.pgim2289.spring.model.BaseEntity;
import edu.ubb.licenta.pgim2289.spring.model.ServiceProvided;
import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TreatmentPlanMapper {

    @Mapping(source = "patient.user.id", target = "patientId")
    @Mapping(source = "primaryService.id", target = "primaryServiceId")
    @Mapping(source = "primaryService.name", target = "primaryServiceName")
    @Mapping(source = "plannedServices", target = "plannedServiceIds", qualifiedByName = "mapServiceIds")
    @Mapping(source = "plannedServices", target = "plannedServiceNames", qualifiedByName = "mapServiceNames")
    TreatmentPlanDTO toDto(TreatmentPlan plan);

    @Mapping(source = "service.name", target = "serviceName")
    PlanAppointmentDTO toPlanAppointmentDto(Appointment appointment);


    @Named("mapServiceIds")
    default Set<Long> mapServiceIds(Set<ServiceProvided> services) {
        if (services == null) {
            return null;
        }
        return services.stream().map(BaseEntity::getId).collect(Collectors.toSet());
    }

    @Named("mapServiceNames")
    default List<String> mapServiceNames(Set<ServiceProvided> services) {
        if (services == null) {
            return null;
        }
        return services.stream().map(ServiceProvided::getName).collect(Collectors.toList());
    }
}