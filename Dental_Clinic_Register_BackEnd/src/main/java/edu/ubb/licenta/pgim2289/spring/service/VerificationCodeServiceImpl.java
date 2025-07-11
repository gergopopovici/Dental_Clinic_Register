package edu.ubb.licenta.pgim2289.spring.service;

import edu.ubb.licenta.pgim2289.spring.model.VerificationCode;
import edu.ubb.licenta.pgim2289.spring.repository.VerificationCodeRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class VerificationCodeServiceImpl implements VerificationCodeService {
    private final VerificationCodeRepository repository;
    private final SecureRandom random = new SecureRandom();

    public VerificationCodeServiceImpl(VerificationCodeRepository repository) {
        this.repository = repository;
    }

    @Override
    public String generateVerificationCode(Long userId, String purpose) {
        String code = String.valueOf(100000 + random.nextInt(900000));
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setUserId(userId);
        verificationCode.setPurpose(purpose);
        verificationCode.setCode(code);
        verificationCode.setUsed(false);
        verificationCode.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        repository.save(verificationCode);
        return code;
    }

    @Override
    public Boolean checkVerificationCode(Long userId, String code, String purpose) {
        Optional<VerificationCode> optionalCode = repository.findValidCode(userId, code, purpose);
        if (optionalCode.isEmpty()) {
            return false;
        }
        VerificationCode verificationCode = optionalCode.get();
        if (verificationCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }
        verificationCode.setUsed(true);
        repository.save(verificationCode);
        return true;
    }
}
