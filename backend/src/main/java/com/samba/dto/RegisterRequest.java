package com.samba.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Full name is required") @Size(max = 100) String fullName,
        @NotBlank(message = "Email is required") @Email(message = "Invalid email format") @Size(max = 150) String email,
        @NotBlank(message = "Password is required")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,64}$",
                message = "Password must be 8-64 characters and include at least one letter and one number") String password,
        @Pattern(regexp = "^\\+?[0-9\\s-]{7,20}$", message = "Enter a valid phone number") String phone,
        @Size(max = 500) String address) {
}
