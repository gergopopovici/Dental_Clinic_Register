package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;
import edu.ubb.licenta.pgim2289.spring.exception.TreatmentPlanException;
import edu.ubb.licenta.pgim2289.spring.model.BraceComponents;
import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import edu.ubb.licenta.pgim2289.spring.model.User;
import edu.ubb.licenta.pgim2289.spring.repository.BraceComponentsRepository;
import edu.ubb.licenta.pgim2289.spring.repository.TreatmentPlanRepository;
import edu.ubb.licenta.pgim2289.spring.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BraceComponentServiceImpl implements BraceComponentService {

    private final BraceComponentsRepository braceComponentsRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final UserRepository userRepository;

    public BraceComponentServiceImpl(BraceComponentsRepository braceComponentsRepository,
                                     TreatmentPlanRepository treatmentPlanRepository,
                                     UserRepository userRepository) {
        this.braceComponentsRepository = braceComponentsRepository;
        this.treatmentPlanRepository = treatmentPlanRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public List<BraceComponentDTO> syncBraceComponents(Long treatmentPlanId, List<BraceComponentDTO> requestList) {
        TreatmentPlan treatmentPlan = treatmentPlanRepository.findById(treatmentPlanId)
                .orElseThrow(() -> new TreatmentPlanException("error.treatment_plan.not_found"));

        braceComponentsRepository.deleteAllByTreatmentPlanId(treatmentPlanId);

        List<BraceComponents> newComponents = requestList.stream().map(dto -> {
            BraceComponents component = new BraceComponents();
            component.setTreatmentPlan(treatmentPlan);
            component.setType(dto.getType());
            component.setColour(dto.getColour());
            component.setPositionX(dto.getPositionX());
            component.setPositionY(dto.getPositionY());
            component.setPositionZ(dto.getPositionZ());
            component.setStartPositionX(dto.getStartPositionX());
            component.setStartPositionY(dto.getStartPositionY());
            component.setStartPositionZ(dto.getStartPositionZ());
            component.setEndPositionX(dto.getEndPositionX());
            component.setEndPositionY(dto.getEndPositionY());
            component.setEndPositionZ(dto.getEndPositionZ());
            return component;
        }).collect(Collectors.toList());

        List<BraceComponents> savedComponents = braceComponentsRepository.saveAll(newComponents);
        return savedComponents.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Override
    public List<BraceComponentDTO> getBraceComponentsByTreatmentPlanId(Long treatmentPlanId, Long currentUserId) {
        TreatmentPlan plan = treatmentPlanRepository.findById(treatmentPlanId)
                .orElseThrow(() -> new TreatmentPlanException("error.treatment_plan.not_found"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("error.user.not_found"));

        boolean isPatient = currentUser.getRoles().stream()
                .anyMatch(r -> r.getRoleName().name().equals("ROLE_PATIENT"));

        if (isPatient) {
            if (!plan.getPatient().getUser().getId().equals(currentUserId)) {
                throw new AccessDeniedException("error.unauthorized_plan_access");
            }
        }

        return braceComponentsRepository.findByTreatmentPlanId(treatmentPlanId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private BraceComponentDTO convertToDto(BraceComponents component) {
        BraceComponentDTO dto = new BraceComponentDTO();
        dto.setId(component.getId());
        dto.setTreatmentPlanId(Long.valueOf(component.getTreatmentPlan().getId()));
        dto.setType(component.getType());
        dto.setColour(component.getColour());
        dto.setPositionX(component.getPositionX());
        dto.setPositionY(component.getPositionY());
        dto.setPositionZ(component.getPositionZ());
        dto.setStartPositionX(component.getStartPositionX());
        dto.setStartPositionY(component.getStartPositionY());
        dto.setStartPositionZ(component.getStartPositionZ());
        dto.setEndPositionX(component.getEndPositionX());
        dto.setEndPositionY(component.getEndPositionY());
        dto.setEndPositionZ(component.getEndPositionZ());
        return dto;
    }
}