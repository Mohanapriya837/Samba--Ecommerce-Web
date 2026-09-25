package com.samba.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record BookRequest(
        @NotBlank(message = "Title is required") @Size(max = 255) String title,
        @NotBlank(message = "Author is required") @Size(max = 150) String author,
        @Size(max = 20) String isbn,
        @Size(max = 2000) String description,
        @NotNull(message = "Price is required") @DecimalMin(value = "0.01", message = "Price must be at least 0.01")
        @Digits(integer = 8, fraction = 2, message = "Invalid price format") BigDecimal price,
        @NotNull(message = "Stock is required") @Min(value = 0, message = "Stock cannot be negative") Integer stock,
        @Size(max = 500) String imageUrl,
        @Size(max = 150) String publisher,
        @NotNull(message = "Category is required") Long categoryId) {
}
