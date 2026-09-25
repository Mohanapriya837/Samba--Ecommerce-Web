package com.samba.service;

import com.samba.dto.CheckoutRequest;
import com.samba.dto.OrderResponse;
import com.samba.dto.PageResponse;
import com.samba.entity.*;
import com.samba.exception.BadRequestException;
import com.samba.exception.ResourceNotFoundException;
import com.samba.mapper.EntityMapper;
import com.samba.repository.BookRepository;
import com.samba.repository.CartRepository;
import com.samba.repository.OrderRepository;
import com.samba.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.Map;
import java.util.Set;
import java.time.LocalDateTime;

import static com.samba.entity.OrderStatus.*;

@Service
public class OrderService {

    /** Allowed status transitions (admin). */
    private static final Map<OrderStatus, Set<OrderStatus>> TRANSITIONS = Map.of(
            PENDING, Set.of(CONFIRMED, CANCELLED),
            CONFIRMED, Set.of(SHIPPED, CANCELLED),
            SHIPPED, Set.of(DELIVERED),
            DELIVERED, Set.of(),
            CANCELLED, Set.of());

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository,
                        BookRepository bookRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    // ---------------------------------------------------------------- user

    @Transactional
    public OrderResponse checkout(String email, CheckoutRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(PENDING);
        order.setShippingAddress(req.shippingAddress().trim());
        order.setPhone(req.phone().trim());
        order.setPaymentMethod(req.paymentMethod());

        BigDecimal total = BigDecimal.ZERO;
        // lock books in id order to avoid deadlocks between concurrent checkouts
        var sorted = cart.getItems().stream().sorted(Comparator.comparing(i -> i.getBook().getId())).toList();
        for (CartItem ci : sorted) {
            Book book = bookRepository.findByIdForUpdate(ci.getBook().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
            if (!book.isActive()) {
                throw new BadRequestException("'" + book.getTitle() + "' is no longer available");
            }
            if (book.getStock() < ci.getQuantity()) {
                throw new BadRequestException("Insufficient stock for '" + book.getTitle() + "'. Available: " + book.getStock());
            }
            book.setStock(book.getStock() - ci.getQuantity());

            BigDecimal subtotal = book.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            OrderItem oi = new OrderItem();
            oi.setBook(book);
            oi.setBookTitle(book.getTitle());
            oi.setUnitPrice(book.getPrice());
            oi.setQuantity(ci.getQuantity());
            oi.setSubtotal(subtotal);
            order.addItem(oi);
            total = total.add(subtotal);
        }
        order.setTotalAmount(total);
        orderRepository.save(order);
        cart.getItems().clear();
        return EntityMapper.toOrder(order);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> myOrders(String email, int page, int size) {
        return PageResponse.of(orderRepository.findByUserEmail(email, pageable(page, size)), EntityMapper::toOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse myOrder(String email, Long id) {
        return EntityMapper.toOrder(orderRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id)));
    }

    @Transactional
    public OrderResponse cancelMyOrder(String email, Long id) {
        Order order = orderRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id));
        if (order.getStatus() != PENDING) {
            throw new BadRequestException("Only PENDING orders can be cancelled");
        }
        cancel(order);
        return EntityMapper.toOrder(order);
    }

    // --------------------------------------------------------------- admin

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> allOrders(OrderStatus status, int page, int size) {
        Pageable pageable = pageable(page, size);
        Page<Order> result = status == null ? orderRepository.findAll(pageable)
                : orderRepository.findByStatus(status, pageable);
        return PageResponse.of(result, EntityMapper::toOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse orderById(Long id) {
        return EntityMapper.toOrder(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id)));
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id));
        OrderStatus current = order.getStatus();
        if (current == newStatus) {
            return EntityMapper.toOrder(order);
        }
        if (!TRANSITIONS.get(current).contains(newStatus)) {
            throw new BadRequestException("Cannot change order status from " + current + " to " + newStatus);
        }
        if (newStatus == CANCELLED) {
            cancel(order);
        } else {
            order.setStatus(newStatus);
        }
        return EntityMapper.toOrder(orderRepository.save(order));
    }

    /** Automatically advances delivery orders: day 2 confirmed, day 4 shipped, day 7 delivered. */
    @Transactional
    @Scheduled(fixedDelay = 60 * 60 * 1000L)
    public void autoProgressOrders() {
        LocalDateTime now = LocalDateTime.now();
        orderRepository.findAll().forEach(order -> {
            if (order.getStatus() == CANCELLED || order.getStatus() == DELIVERED) return;
            long days = java.time.Duration.between(order.getCreatedAt(), now).toDays();
            if (days >= 7 && order.getStatus() == SHIPPED) order.setStatus(DELIVERED);
            else if (days >= 4 && order.getStatus() == CONFIRMED) order.setStatus(SHIPPED);
            else if (days >= 2 && order.getStatus() == PENDING) order.setStatus(CONFIRMED);
        });
    }

    // ------------------------------------------------------------- helpers

    private void cancel(Order order) {
        for (OrderItem item : order.getItems()) {
            Book book = bookRepository.findByIdForUpdate(item.getBook().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
            book.setStock(book.getStock() + item.getQuantity());
        }
        order.setStatus(CANCELLED);
    }

    private Pageable pageable(int page, int size) {
        return PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
    }
}
