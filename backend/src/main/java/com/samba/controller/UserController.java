package com.samba.controller;

import com.samba.dto.ChangePasswordRequest;
import com.samba.dto.MessageResponse;
import com.samba.dto.UpdateProfileRequest;
import com.samba.dto.UserResponse;
import com.samba.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserResponse> profile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping
    public ResponseEntity<UserResponse> update(Authentication auth, @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(Authentication auth,
                                                          @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(auth.getName(), request);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }
}
