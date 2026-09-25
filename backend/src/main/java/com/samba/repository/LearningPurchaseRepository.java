package com.samba.repository;

import com.samba.entity.LearningPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LearningPurchaseRepository extends JpaRepository<LearningPurchase, Long> {
    boolean existsByUserEmailAndContentId(String email, Long contentId);
    Optional<LearningPurchase> findByUserEmailAndContentId(String email, Long contentId);
    List<LearningPurchase> findByUserEmailOrderByCreatedAtDesc(String email);
}
