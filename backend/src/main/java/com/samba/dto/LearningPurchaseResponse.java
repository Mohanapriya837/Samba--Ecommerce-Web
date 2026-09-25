package com.samba.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LearningPurchaseResponse(Long id, Long contentId, String contentTitle,
                                       BigDecimal amount, String paymentMethod, LocalDateTime purchasedAt) {}
