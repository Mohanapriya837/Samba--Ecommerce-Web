package com.samba.repository;

import com.samba.entity.Order;
import com.samba.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("select count(o) > 0 from Order o join o.items i where o.user.email = :email and i.book.id = :bookId and o.status <> com.samba.entity.OrderStatus.CANCELLED")
    boolean hasPurchasedBook(@org.springframework.data.repository.query.Param("email") String email, @org.springframework.data.repository.query.Param("bookId") Long bookId);

    Page<Order> findByUserEmail(String email, Pageable pageable);

    Optional<Order> findByIdAndUserEmail(Long id, String email);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> com.samba.entity.OrderStatus.CANCELLED")
    BigDecimal totalRevenue();
}
