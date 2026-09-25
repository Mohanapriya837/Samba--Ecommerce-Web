package com.samba.controller;

import com.samba.dto.CheckoutRequest;
import com.samba.dto.OrderResponse;
import com.samba.dto.PageResponse;
import com.samba.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Checkout: converts the authenticated user's cart into an order. */
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(Authentication auth, @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.checkout(auth.getName(), request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderResponse>> history(Authentication auth,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.myOrders(auth.getName(), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> details(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.myOrder(auth.getName(), id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelMyOrder(auth.getName(), id));
    }
}
