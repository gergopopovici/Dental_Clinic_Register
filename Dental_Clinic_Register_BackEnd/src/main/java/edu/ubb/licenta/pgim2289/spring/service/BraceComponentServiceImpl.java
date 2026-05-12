package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;
import edu.ubb.licenta.pgim2289.spring.exception.TreatmentPlanException;
import edu.ubb.licenta.pgim2289.spring.model.BraceComponents;
import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import edu.ubb.licenta.pgim2289.spring.repository.BraceComponentsRepository;
import edu.ubb.licenta.pgim2289.spring.repository.TreatmentPlanRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BraceComponentServiceImpl implements BraceComponentService {

    private final BraceComponentsRepository braceComponentsRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;

    public BraceComponentServiceImpl(BraceComponentsRepository braceComponentsRepository,
                                     TreatmentPlanRepository treatmentPlanRepository) {
        this.braceComponentsRepository = braceComponentsRepository;
        this.treatmentPlanRepository = treatmentPlanRepository;
    }

    @Override
    @Transactional
    public List<BraceComponentDTO> syncBraceComponents(Integer treatmentPlanId, List<BraceComponentDTO> requestList) {
        TreatmentPlan treatmentPlan = treatmentPlanRepository.findById(treatmentPlanId)
                .orElseThrow(() -> new TreatmentPlanException("Treatment Plan not found with id " + treatmentPlanId));

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
    public List<BraceComponentDTO> getBraceComponentsByTreatmentPlanId(Integer treatmentPlanId) {
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