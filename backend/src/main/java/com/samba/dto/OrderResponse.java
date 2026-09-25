package com.samba.dto;

import com.samba.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(Long id, OrderStatus status, BigDecimal totalAmount, String shippingAddress, String phone,
                            String paymentMethod, Long userId, String customerName, String customerEmail,
                            LocalDateTime createdAt, LocalDateTime updatedAt, List<OrderItemResponse> items) {
}
