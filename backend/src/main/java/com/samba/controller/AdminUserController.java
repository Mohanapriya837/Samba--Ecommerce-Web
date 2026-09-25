package com.samba.controller;

import com.samba.dto.PageResponse;
import com.samba.dto.UpdateUserStatusRequest;
import com.samba.dto.UserResponse;
import com.samba.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminService adminService;

    public AdminUserController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<UserResponse>> all(@RequestParam(required = false) String keyword,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.users(keyword, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> one(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.user(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> setStatus(Authentication auth, @PathVariable Long id,
                                                  @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.setEnabled(id, request.enabled(), auth.getName()));
    }
}
