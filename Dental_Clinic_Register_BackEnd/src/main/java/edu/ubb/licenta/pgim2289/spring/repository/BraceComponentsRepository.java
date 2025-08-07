package edu.ubb.licenta.pgim2289.spring.repository;

import edu.ubb.licenta.pgim2289.spring.model.BraceComponents;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BraceComponentsRepository extends JpaRepository<BraceComponents, Integer> {
    List<BraceComponents> findByTreatmentPlanId(Integer treatmentPlanId);

    boolean findByPositionXAndPositionYAndPositionY(double positionX, double positionY, double positionY1);

    void deleteByPositionXAndPositionYAndPositionZ(double positionX, double positionY, double positionZ);

    boolean findByStartPositionXAndStartPositionYAndStartPositionZAndEndPositionXAndEndPositionYAndEndPositionZ(double startPositionX, double startPositionY, double startPositionZ, double endPositionX, double endPositionY, double endPositionZ);

    void deleteByStartPositionXAndStartPositionYAndStartPositionZAndEndPositionXAndEndPositionYAndEndPositionZ(double startPositionX, double startPositionY, double startPositionZ, double endPositionX, double endPositionY, double endPositionZ);
}
