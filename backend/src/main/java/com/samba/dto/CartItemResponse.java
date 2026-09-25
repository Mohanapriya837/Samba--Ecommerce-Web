package com.samba.dto;

import java.math.BigDecimal;

public record CartItemResponse(Long id, Long bookId, String title, String author, String imageUrl,
                               BigDecimal unitPrice, int quantity, BigDecimal subtotal, int availableStock) {
}
