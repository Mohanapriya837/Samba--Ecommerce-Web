package com.samba.controller;

import com.samba.dto.CartItemRequest;
import com.samba.dto.CartResponse;
import com.samba.dto.UpdateCartItemRequest;
import com.samba.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> get(Authentication auth) {
        return ResponseEntity.ok(cartService.getCart(auth.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> add(Authentication auth, @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(auth.getName(), request.bookId(), request.quantity()));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> update(Authentication auth, @PathVariable Long itemId,
                                               @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateItem(auth.getName(), itemId, request.quantity()));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> remove(Authentication auth, @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(auth.getName(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<CartResponse> clear(Authentication auth) {
        return ResponseEntity.ok(cartService.clear(auth.getName()));
    }
}
