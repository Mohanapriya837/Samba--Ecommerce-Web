package com.samba.mapper;

import com.samba.dto.*;
import com.samba.entity.*;

import java.math.BigDecimal;

public final class EntityMapper {

    private EntityMapper() {}

    public static UserResponse toUser(User u) {
        return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getAddress(), u.getRole(),
                u.isEnabled(), u.getCreatedAt());
    }

    public static CategoryResponse toCategory(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getDescription());
    }

    public static BookResponse toBook(Book b) {
        return new BookResponse(b.getId(), b.getTitle(), b.getAuthor(), b.getIsbn(), b.getDescription(), b.getPrice(),
                b.getStock(), b.getStock() > 0, b.getImageUrl(), b.getPublisher(), b.getCategory().getId(),
                b.getCategory().getName(), b.getCreatedAt());
    }

    public static CartItemResponse toCartItem(CartItem i) {
        Book b = i.getBook();
        BigDecimal subtotal = b.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
        return new CartItemResponse(i.getId(), b.getId(), b.getTitle(), b.getAuthor(), b.getImageUrl(), b.getPrice(),
                i.getQuantity(), subtotal, b.getStock());
    }

    public static CartResponse toCart(Cart cart) {
        var items = cart.getItems().stream().map(EntityMapper::toCartItem).toList();
        int totalItems = items.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal total = items.stream().map(CartItemResponse::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(cart.getId(), items, totalItems, total);
    }

    public static OrderItemResponse toOrderItem(OrderItem i) {
        return new OrderItemResponse(i.getId(), i.getBook().getId(), i.getBookTitle(), i.getUnitPrice(),
                i.getQuantity(), i.getSubtotal());
    }

    public static OrderResponse toOrder(Order o) {
        User u = o.getUser();
        return new OrderResponse(o.getId(), o.getStatus(), o.getTotalAmount(), o.getShippingAddress(), o.getPhone(),
                o.getPaymentMethod(), u.getId(), u.getFullName(), u.getEmail(), o.getCreatedAt(), o.getUpdatedAt(),
                o.getItems().stream().map(EntityMapper::toOrderItem).toList());
    }
}
