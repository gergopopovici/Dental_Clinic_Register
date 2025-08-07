package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;
import edu.ubb.licenta.pgim2289.spring.exception.BraceComponentException;
import edu.ubb.licenta.pgim2289.spring.exception.TreatmentPlanException;
import edu.ubb.licenta.pgim2289.spring.model.BraceComponents;
import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import edu.ubb.licenta.pgim2289.spring.repository.BraceComponentsRepository;
import edu.ubb.licenta.pgim2289.spring.repository.TreatmentPlanRepository;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
    public BraceComponentDTO addBraceComponent(Integer treatmentPlanId, BraceComponentDTO request) {
        TreatmentPlan treatmentPlan = treatmentPlanRepository.findById(treatmentPlanId)
                .orElseThrow(() -> new TreatmentPlanException("Treatment Plan not found with id " + treatmentPlanId));
        BraceComponents component = new BraceComponents();
        component.setTreatmentPlan(treatmentPlan);
        component.setType(request.getType());
        component.setColour(request.getColour());
        component.setPositionX(request.getPositionX());
        component.setPositionY(request.getPositionY());
        component.setPositionZ(request.getPositionZ());
        component.setStartPositionX(request.getStartPositionX());
        component.setStartPositionY(request.getStartPositionY());
        component.setStartPositionZ(request.getStartPositionZ());
        component.setEndPositionX(request.getEndPositionX());
        component.setEndPositionY(request.getEndPositionY());
        component.setEndPositionZ(request.getEndPositionZ());
        BraceComponents savedComponent = braceComponentsRepository.save(component);
        return convertToDto(savedComponent);
    }

    @Override
    public List<BraceComponentDTO> getBraceComponentsByTreatmentPlanId(Integer treatmentPlanId) {
        return braceComponentsRepository.findByTreatmentPlanId(treatmentPlanId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteBraceComponent(Integer componentId) {
        if (!braceComponentsRepository.existsById(componentId)) {
            throw new BraceComponentException("Brace component not found with id " + componentId);
        }
        braceComponentsRepository.deleteById(componentId);
    }

    @Override
    public void deleteBraceComponentByCoordinates(Double positionX, Double positionY, Double positionZ) {
        if (!braceComponentsRepository.findByPositionXAndPositionYAndPositionY(positionX, positionY, positionZ)) {
            throw new BraceComponentException("Brace component (brace) not found with coordinates "
                    + positionX + " " + positionY + " " + positionZ);
        }
        braceComponentsRepository.deleteByPositionXAndPositionYAndPositionZ(positionX, positionY, positionZ);
    }

    @Override
    public void deleteRubberBandByCoordinates(Double startPositionX, Double startPositionY, Double startPositionZ,
                                              Double endPositionX, Double endPositionY, Double endPositionZ) {
        if (!braceComponentsRepository.
                findByStartPositionXAndStartPositionYAndStartPositionZAndEndPositionXAndEndPositionYAndEndPositionZ(
                        startPositionX, startPositionY, startPositionZ, endPositionX, endPositionY, endPositionZ
                )) {
            throw new BraceComponentException("Brace component (rubber band) not found with coordinates "
                    + startPositionX + " " + startPositionY + " " + startPositionZ + " "
                    + endPositionX + " " + endPositionY + " " + endPositionZ);
        }
        braceComponentsRepository.
                deleteByStartPositionXAndStartPositionYAndStartPositionZAndEndPositionXAndEndPositionYAndEndPositionZ(
                        startPositionX, startPositionY, startPositionZ, endPositionX, endPositionY, endPositionZ);
    }

    private BraceComponentDTO convertToDto(BraceComponents component) {
        BraceComponentDTO dto = new BraceComponentDTO();
        dto.setId(component.getId());
        dto.setTreatmentPlanId(component.getTreatmentPlan().getId());
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
