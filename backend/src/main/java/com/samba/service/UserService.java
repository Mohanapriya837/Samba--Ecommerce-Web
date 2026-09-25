package com.samba.service;

import com.samba.dto.ChangePasswordRequest;
import com.samba.dto.UpdateProfileRequest;
import com.samba.dto.UserResponse;
import com.samba.entity.User;
import com.samba.exception.BadRequestException;
import com.samba.exception.ResourceNotFoundException;
import com.samba.mapper.EntityMapper;
import com.samba.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        return EntityMapper.toUser(find(email));
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = find(email);
        user.setFullName(req.fullName().trim());
        user.setPhone(req.phone());
        user.setAddress(req.address());
        return EntityMapper.toUser(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = find(email);
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    private User find(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
