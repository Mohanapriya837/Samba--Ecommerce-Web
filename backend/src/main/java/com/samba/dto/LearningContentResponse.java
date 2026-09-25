package com.samba.dto;

import com.samba.entity.LearningContentType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LearningContentResponse(Long id, Long bookId, String bookTitle, LearningContentType type,
                                      String title, String chapter, String description, String url,
                                      String thumbnailUrl, String duration, BigDecimal price, boolean purchased,
                                      boolean active, LocalDateTime createdAt) {}
