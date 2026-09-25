package com.samba.dto;

import java.math.BigDecimal;

public record OrderItemResponse(Long id, Long bookId, String bookTitle, BigDecimal unitPrice, int quantity,
                                BigDecimal subtotal) {
}
