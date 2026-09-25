package com.samba.controller;

import com.samba.dto.OrderResponse;
import com.samba.dto.PageResponse;
import com.samba.dto.UpdateOrderStatusRequest;
import com.samba.entity.OrderStatus;
import com.samba.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> all(@RequestParam(required = false) OrderStatus status,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.allOrders(status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> one(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.orderById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request.status()));
    }
}
