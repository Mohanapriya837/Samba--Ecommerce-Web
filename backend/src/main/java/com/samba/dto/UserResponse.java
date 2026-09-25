package com.samba.dto;

import com.samba.entity.Role;

import java.time.LocalDateTime;

public record UserResponse(Long id, String fullName, String email, String phone, String address, Role role,
                           boolean enabled, LocalDateTime createdAt) {
}
