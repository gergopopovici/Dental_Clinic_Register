package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.TreatmentPlanDTO;
import edu.ubb.licenta.pgim2289.spring.mapper.TreatmentPlanMapper;
import edu.ubb.licenta.pgim2289.spring.model.*;
import edu.ubb.licenta.pgim2289.spring.repository.TreatmentPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TreatmentPlanServiceImpl implements TreatmentPlanService {
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final PatientService patientService;
    private final UserService userService;
    private final ServiceProvidedService serviceProvidedService;
    private final TreatmentPlanMapper treatmentPlanMapper;

    public TreatmentPlanServiceImpl(TreatmentPlanRepository treatmentPlanRepository,
                                    PatientService patientService,
                                    UserService userService,
                                    ServiceProvidedService serviceProvidedService, TreatmentPlanMapper treatmentPlanMapper) {
        this.treatmentPlanRepository = treatmentPlanRepository;
        this.patientService = patientService;
        this.userService = userService;
        this.serviceProvidedService = serviceProvidedService;
        this.treatmentPlanMapper = treatmentPlanMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreatmentPlanDTO> getPlansByPatientId(Long userId) {
        return treatmentPlanRepository.findByPatient_User_Id(userId).stream()
                .map(treatmentPlanMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TreatmentPlanDTO createPlan(TreatmentPlanDTO dto) {
        User user = userService.findById(dto.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("error.user.not_found"));
        Patient patient = patientService.getPatient(user);
        ServiceProvided primaryService = serviceProvidedService.findById(dto.getPrimaryServiceId())
                .orElseThrow(() -> new IllegalArgumentException("error.service.not.found"));
        TreatmentPlan plan = new TreatmentPlan();
        plan.setPatient(patient);
        plan.setPrimaryService(primaryService);
        plan.setRequires3DModel(dto.isRequires3DModel());
        plan.setStartDate(dto.getStartDate());
        plan.setEndDate(dto.getEndDate());
        plan.setStatus(dto.getStatus());
        plan.setGeneralNotes(dto.getGeneralNotes());

        if (dto.getPlannedServiceIds() != null &&
                !dto.getPlannedServiceIds().isEmpty()) {
            Set<ServiceProvided> services = dto.getPlannedServiceIds().stream()
                    .map(id -> serviceProvidedService.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("error.service.not.found")))
                    .collect(Collectors.toSet());
            plan.setPlannedServices(services);
        }
        return treatmentPlanMapper.toDto(treatmentPlanRepository.save(plan));
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentPlanDTO getPlanById(Long id) {
        return treatmentPlanRepository.findById(id)
                .map(treatmentPlanMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("error.treatment_plan.not_found"));
    }

    @Override
    @Transactional
    public TreatmentPlanDTO updatePlan(Long id, TreatmentPlanDTO dto) {
        TreatmentPlan plan = treatmentPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("error.treatment_plan.not_found"));
        ServiceProvided primaryService = serviceProvidedService.findById(dto.getPrimaryServiceId())
                .orElseThrow(() -> new IllegalArgumentException("error.service.not.found"));

        plan.setPrimaryService(primaryService);
        plan.setRequires3DModel(dto.isRequires3DModel());
        plan.setStartDate(dto.getStartDate());
        plan.setEndDate(dto.getEndDate());
        plan.setStatus(dto.getStatus());
        plan.setGeneralNotes(dto.getGeneralNotes());

        if (dto.getPlannedServiceIds() != null && !dto.getPlannedServiceIds().isEmpty()) {
            Set<ServiceProvided> services = dto.getPlannedServiceIds().stream()
                    .map(serviceId -> serviceProvidedService.findById(serviceId)
                            .orElseThrow(() -> new IllegalArgumentException("error.service.not.found")))
                    .collect(Collectors.toSet());
            plan.setPlannedServices(services);
        } else {
            plan.getPlannedServices().clear();
        }
        return treatmentPlanMapper.toDto(treatmentPlanRepository.save(plan));
    }

    @Override
    @Transactional
    public void deletePlan(Long id) {
        if (!treatmentPlanRepository.existsById(id)) {
            throw new IllegalArgumentException("error.treatment_plan.not_found");
        }
        treatmentPlanRepository.deleteById(id);
    }

    @Override
    public TreatmentPlan getTreatmentPlanEntityById(Long id) {
        return treatmentPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("error.treatment_plan.not_found"));
    }
}