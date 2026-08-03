package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.PanoramaImageDTO;
import edu.ubb.licenta.pgim2289.spring.dto.TreatmentPlanDTO;
import edu.ubb.licenta.pgim2289.spring.model.TreatmentPlan;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface TreatmentPlanService {
    List<TreatmentPlanDTO> getPlansByPatientId(Long userId);

    TreatmentPlanDTO createPlan(TreatmentPlanDTO dto);

    TreatmentPlanDTO getPlanById(Long id);

    TreatmentPlanDTO updatePlan(Long id, TreatmentPlanDTO dto);

    void deletePlan(Long id);

    TreatmentPlan getTreatmentPlanEntityById(Long id);

    PanoramaImageDTO savePanoramaImage(Long planId, MultipartFile file);
}
