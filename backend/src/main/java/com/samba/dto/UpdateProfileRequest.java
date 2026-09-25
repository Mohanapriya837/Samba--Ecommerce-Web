package com.samba.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Full name is required") @Size(max = 100) String fullName,
        @Pattern(regexp = "^\\+?[0-9\\s-]{7,20}$", message = "Enter a valid phone number") String phone,
        @Size(max = 500) String address) {
}
