package com.samba.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardResponse(long totalUsers, long totalBooks, long totalOrders, BigDecimal totalRevenue,
                                long lowStockBooks, Map<String, Long> ordersByStatus,
                                List<OrderResponse> recentOrders) {
}
