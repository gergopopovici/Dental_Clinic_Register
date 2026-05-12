package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.BraceComponentDTO;

import java.util.List;

public interface BraceComponentService {
    List<BraceComponentDTO> syncBraceComponents(Integer treatmentPlanId, List<BraceComponentDTO> requestList);

    List<BraceComponentDTO> getBraceComponentsByTreatmentPlanId(Integer treatmentPlanId);
}