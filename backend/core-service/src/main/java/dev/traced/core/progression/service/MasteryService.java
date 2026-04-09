package dev.traced.core.progression.service;

import dev.traced.core.profile.entity.UserProfile;
import dev.traced.core.progression.entity.MasteryRecord;
import dev.traced.core.progression.repository.MasteryRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasteryService {

    private final MasteryRecordRepository masteryRecordRepository;

    public void update(UUID userProfileId, String systemCanonicalId, boolean wasCorrect, UserProfile userProfile) {
        MasteryRecord record = masteryRecordRepository
            .findByUserProfileIdAndSystemCanonicalId(userProfileId, systemCanonicalId)
            .orElseGet(() -> MasteryRecord.builder()
                .userProfile(userProfile)
                .systemCanonicalId(systemCanonicalId)
                .masteryPct(BigDecimal.ZERO)
                .casesAttempted(0)
                .casesCorrect(0)
                .build()
            );

        record.setCasesAttempted(record.getCasesAttempted() + 1);
        if (wasCorrect) {
            record.setCasesCorrect(record.getCasesCorrect() + 1);
        }

        BigDecimal pct = BigDecimal.valueOf(record.getCasesCorrect())
            .multiply(BigDecimal.valueOf(100))
            .divide(BigDecimal.valueOf(record.getCasesAttempted()), 2, RoundingMode.HALF_UP);

        record.setMasteryPct(pct);
        record.setLastUpdatedAt(LocalDateTime.now());
        masteryRecordRepository.save(record);
    }
}
