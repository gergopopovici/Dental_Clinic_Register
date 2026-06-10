package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.dto.ClinicSettingsDTO;
import edu.ubb.licenta.pgim2289.spring.dto.MessageResponse;
import edu.ubb.licenta.pgim2289.spring.mapper.ClinicSettingsMapper;
import edu.ubb.licenta.pgim2289.spring.model.ClinicSettings;
import edu.ubb.licenta.pgim2289.spring.repository.ClinicSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ClinicSettingsServiceImpl implements ClinicSettingsService {
    private final ClinicSettingsRepository repository;
    private final ClinicSettingsMapper mapper;

    public ClinicSettingsServiceImpl(ClinicSettingsRepository repository, ClinicSettingsMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public ClinicSettingsDTO getSettings() {
        return repository.findTopByOrderByIdAsc()
                .map(mapper::toDto)
                .orElseThrow(() -> new RuntimeException("clinic.settings.not.found"));
    }

    @Override
    public ResponseEntity<MessageResponse> updateSettings(ClinicSettingsDTO dto) {
        ClinicSettings settings = repository.findTopByOrderByIdAsc()
                .orElse(new ClinicSettings());
        settings.setDefaultStartTime(dto.getDefaultStartTime());
        settings.setDefaultEndTime(dto.getDefaultEndTime());
        repository.save(settings);
        return ResponseEntity.ok(new MessageResponse("clinic.settings.updated.successfully"));
    }
}
