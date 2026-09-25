package com.samba.repository;

import com.samba.entity.LearningContent;
import com.samba.entity.LearningContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LearningContentRepository extends JpaRepository<LearningContent, Long> {
    List<LearningContent> findByBookIdAndActiveTrueOrderByIdAsc(Long bookId);
    List<LearningContent> findByBookIdAndTypeAndActiveTrueOrderByIdAsc(Long bookId, LearningContentType type);
}
