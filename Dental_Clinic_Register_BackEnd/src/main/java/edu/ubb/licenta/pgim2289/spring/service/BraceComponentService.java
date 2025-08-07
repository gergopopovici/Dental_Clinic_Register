package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;
import jakarta.persistence.criteria.CriteriaBuilder;

import java.util.List;

public interface BraceComponentService {
    BraceComponentDTO addBraceComponent(Integer treatmentPlanId, BraceComponentDTO request);

    List<BraceComponentDTO> getBraceComponentsByTreatmentPlanId(Integer treatmentPlanId);

    void deleteBraceComponent(Integer componentId);

    void deleteBraceComponentByCoordinates(Double positionX, Double positionY, Double positionZ);

    void deleteRubberBandByCoordinates(Double startPositionX, Double startPositionY, Double startPositionZ,
                                       Double endPositionX, Double endPositionY, Double endPositionZ);

}
