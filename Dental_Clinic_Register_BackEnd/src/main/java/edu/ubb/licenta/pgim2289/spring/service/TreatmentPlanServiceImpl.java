package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.TreatmentPlanDTO;
import edu.ubb.licenta.pgim2289.spring.model.*;
import edu.ubb.licenta.pgim2289.spring.repository.TreatmentPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TreatmentPlanServiceImpl implements TreatmentPlanService {
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final PatientService patientService;
    private final UserService userService;
    private final ServiceProvidedService serviceProvidedService;

    public TreatmentPlanServiceImpl(TreatmentPlanRepository treatmentPlanRepository,
                                    PatientService patientService,
                                    UserService userService,
                                    ServiceProvidedService serviceProvidedService) {
        this.treatmentPlanRepository = treatmentPlanRepository;
        this.patientService = patientService;
        this.userService = userService;
        this.serviceProvidedService = serviceProvidedService;
    }

    @Override
    public List<TreatmentPlanDTO> getPlansByPatientId(Long userId) {
        return treatmentPlanRepository.findByPatient_User_Id(userId).stream()
                .map(plan -> {
                    TreatmentPlanDTO dto = new TreatmentPlanDTO();
                    dto.setId(plan.getId());
                    dto.setPatientId(plan.getPatient().getUser().getId());
                    dto.setPlanName(plan.getPlanName());
                    dto.setStartDate(plan.getStartDate());
                    dto.setEndDate(plan.getEndDate());
                    dto.setStatus(plan.getStatus());
                    dto.setNotes(plan.getNotes());
                    if (plan.getServices() != null) {
                        dto.setServiceIds(plan.getServices().stream()
                                .map(BaseEntity::getId)
                                .collect(Collectors.toSet()));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TreatmentPlanDTO createPlan(TreatmentPlanDTO dto) {
        User user = userService.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("error.user.not_found"));

        Patient patient = patientService.getPatient(user);

        TreatmentPlan plan = new TreatmentPlan();
        plan.setPatient(patient);
        plan.setPlanName(dto.getPlanName());
        plan.setStartDate(dto.getStartDate());
        plan.setEndDate(dto.getEndDate());
        plan.setStatus(dto.getStatus());
        plan.setNotes(dto.getNotes());

        if (dto.getServiceIds() != null && !dto.getServiceIds().isEmpty()) {
            Set<ServiceProvided> services = dto.getServiceIds().stream()
                    .map(id -> serviceProvidedService.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("error.service.not.found")))
                    .collect(Collectors.toSet());
            plan.setServices(services);
        }

        TreatmentPlan savedPlan = treatmentPlanRepository.save(plan);

        TreatmentPlanDTO result = new TreatmentPlanDTO();
        result.setId(savedPlan.getId());
        result.setPatientId(savedPlan.getPatient().getUser().getId());
        result.setPlanName(savedPlan.getPlanName());
        result.setStartDate(savedPlan.getStartDate());
        result.setEndDate(savedPlan.getEndDate());
        result.setStatus(savedPlan.getStatus());
        result.setNotes(savedPlan.getNotes());

        if (savedPlan.getServices() != null) {
            result.setServiceIds(savedPlan.getServices().stream()
                    .map(BaseEntity::getId)
                    .collect(Collectors.toSet()));
        }

        return result;
    }

    @Override
    public TreatmentPlanDTO getPlanById(Long id) {
        return treatmentPlanRepository.findById(id)
                .map(plan -> {
                    TreatmentPlanDTO dto = new TreatmentPlanDTO();
                    dto.setId(plan.getId());
                    dto.setPatientId(plan.getPatient().getUser().getId());
                    dto.setPlanName(plan.getPlanName());
                    dto.setStartDate(plan.getStartDate());
                    dto.setEndDate(plan.getEndDate());
                    dto.setStatus(plan.getStatus());
                    dto.setNotes(plan.getNotes());
                    if (plan.getServices() != null) {
                        dto.setServiceIds(plan.getServices().stream()
                                .map(BaseEntity::getId)
                                .collect(Collectors.toSet()));
                    }
                    return dto;
                })
                .orElseThrow(() -> new IllegalArgumentException("error.treatment_plan.not_found"));
    }

    @Override
    @Transactional
    public TreatmentPlanDTO updatePlan(Long id, TreatmentPlanDTO dto) {
        TreatmentPlan plan = treatmentPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("error.treatment_plan.not_found"));

        plan.setPlanName(dto.getPlanName());
        plan.setStartDate(dto.getStartDate());
        plan.setEndDate(dto.getEndDate());
        plan.setStatus(dto.getStatus());
        plan.setNotes(dto.getNotes());

        if (dto.getServiceIds() != null && !dto.getServiceIds().isEmpty()) {
            Set<ServiceProvided> services = dto.getServiceIds().stream()
                    .map(serviceId -> serviceProvidedService.findById(serviceId)
                            .orElseThrow(() -> new IllegalArgumentException("error.service.not.found")))
                    .collect(Collectors.toSet());
            plan.setServices(services);
        } else {
            plan.getServices().clear();
        }

        TreatmentPlan updatedPlan = treatmentPlanRepository.save(plan);

        TreatmentPlanDTO result = new TreatmentPlanDTO();
        result.setId(updatedPlan.getId());
        result.setPatientId(updatedPlan.getPatient().getUser().getId());
        result.setPlanName(updatedPlan.getPlanName());
        result.setStartDate(updatedPlan.getStartDate());
        result.setEndDate(updatedPlan.getEndDate());
        result.setStatus(updatedPlan.getStatus());
        result.setNotes(updatedPlan.getNotes());

        if (updatedPlan.getServices() != null) {
            result.setServiceIds(updatedPlan.getServices().stream()
                    .map(BaseEntity::getId)
                    .collect(Collectors.toSet()));
        }

        return result;
    }

    @Override
    @Transactional
    public void deletePlan(Long id) {
        if (!treatmentPlanRepository.existsById(id)) {
            throw new IllegalArgumentException("error.treatment_plan.not_found");
        }
        treatmentPlanRepository.deleteById(id);
    }
}