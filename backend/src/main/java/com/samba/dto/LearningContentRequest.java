package com.samba.dto;

import com.samba.entity.LearningContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record LearningContentRequest(@NotNull Long bookId, @NotNull LearningContentType type,
                                     @NotBlank String title, String chapter, String description,
                                     @NotBlank String url, String thumbnailUrl, String duration,
                                     @NotNull BigDecimal price, Boolean active) {}
