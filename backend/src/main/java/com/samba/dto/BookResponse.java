package com.samba.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookResponse(Long id, String title, String author, String isbn, String description, BigDecimal price,
                           int stock, boolean inStock, String imageUrl, String publisher, Long categoryId,
                           String categoryName, LocalDateTime createdAt) {
}
