package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.TreatmentPlanDTO;

import java.util.List;

public interface TreatmentPlanService {
    List<TreatmentPlanDTO> getPlansByPatientId(Long userId);

    TreatmentPlanDTO createPlan(TreatmentPlanDTO dto);

    TreatmentPlanDTO getPlanById(Long id);

    TreatmentPlanDTO updatePlan(Long id, TreatmentPlanDTO dto);

    void deletePlan(Long id);
}
