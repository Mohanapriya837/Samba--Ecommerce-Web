package com.samba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @NotBlank(message = "Shipping address is required") @Size(min = 10, max = 500,
                message = "Please enter your full shipping address") String shippingAddress,
        @NotBlank(message = "Phone is required") @Pattern(regexp = "^\\+?[0-9\\s-]{7,20}$",
                message = "Enter a valid phone number") String phone,
        @NotBlank(message = "Payment method is required")
        @Pattern(regexp = "COD|CARD|UPI", message = "Payment method must be COD, CARD or UPI") String paymentMethod) {
}
