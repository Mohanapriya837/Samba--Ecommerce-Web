package com.samba.service;

import com.samba.dto.DashboardResponse;
import com.samba.dto.OrderResponse;
import com.samba.dto.PageResponse;
import com.samba.dto.UserResponse;
import com.samba.entity.OrderStatus;
import com.samba.entity.User;
import com.samba.exception.BadRequestException;
import com.samba.exception.ResourceNotFoundException;
import com.samba.mapper.EntityMapper;
import com.samba.repository.BookRepository;
import com.samba.repository.OrderRepository;
import com.samba.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository, BookRepository bookRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            byStatus.put(s.name(), orderRepository.countByStatus(s));
        }
        List<OrderResponse> recent = orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(EntityMapper::toOrder).toList();
        return new DashboardResponse(userRepository.count(), bookRepository.countByActiveTrue(),
                orderRepository.count(), orderRepository.totalRevenue(),
                bookRepository.countByActiveTrueAndStockLessThanEqual(LOW_STOCK_THRESHOLD), byStatus, recent);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> users(String keyword, int page, int size) {
        String k = keyword == null ? "" : keyword.trim();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return PageResponse.of(
                userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(k, k, pageable),
                EntityMapper::toUser);
    }

    @Transactional(readOnly = true)
    public UserResponse user(Long id) {
        return EntityMapper.toUser(find(id));
    }

    @Transactional
    public UserResponse setEnabled(Long id, boolean enabled, String currentAdminEmail) {
        User user = find(id);
        if (!enabled && user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new BadRequestException("You cannot disable your own account");
        }
        user.setEnabled(enabled);
        return EntityMapper.toUser(userRepository.save(user));
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }
}
