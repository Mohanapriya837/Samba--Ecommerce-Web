package com.samba.service;

import com.samba.dto.*;
import com.samba.entity.*;
import com.samba.exception.BadRequestException;
import com.samba.exception.ResourceNotFoundException;
import com.samba.repository.BookRepository;
import com.samba.repository.LearningContentRepository;
import com.samba.repository.LearningPurchaseRepository;
import com.samba.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LearningContentService {
    private final LearningContentRepository contentRepository;
    private final BookRepository bookRepository;
    private final LearningPurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public LearningContentService(LearningContentRepository contentRepository, BookRepository bookRepository,
                                  LearningPurchaseRepository purchaseRepository, UserRepository userRepository) {
        this.contentRepository = contentRepository;
        this.bookRepository = bookRepository;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
    }

    /** Public-to-users learning catalogue. A book purchase does NOT unlock digital lessons. */
    @Transactional(readOnly = true)
    public List<LearningContentResponse> catalog(String email, Long bookId) {
        User user = getUser(email);
        List<LearningContent> items = bookId == null
                ? contentRepository.findAll().stream().filter(LearningContent::isActive).toList()
                : contentRepository.findByBookIdAndActiveTrueOrderByIdAsc(bookId);
        return items.stream().map(c -> map(c, purchaseRepository.existsByUserEmailAndContentId(email, c.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public List<LearningContentResponse> purchased(String email) {
        getUser(email);
        return purchaseRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(p -> map(p.getContent(), true)).toList();
    }

    @Transactional
    public LearningPurchaseResponse purchase(String email, Long contentId, String paymentMethod) {
        User user = getUser(email);
        LearningContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning content not found"));
        if (!content.isActive()) throw new BadRequestException("This lesson is not available");
        if (purchaseRepository.existsByUserEmailAndContentId(email, contentId))
            throw new BadRequestException("You already purchased this lesson");

        LearningPurchase p = new LearningPurchase();
        p.setUser(user);
        p.setContent(content);
        p.setAmount(content.getPrice() == null ? BigDecimal.ZERO : content.getPrice());
        p.setPaymentMethod(paymentMethod == null || paymentMethod.isBlank() ? "ONLINE" : paymentMethod);
        p = purchaseRepository.save(p);
        return new LearningPurchaseResponse(p.getId(), content.getId(), content.getTitle(), p.getAmount(),
                p.getPaymentMethod(), p.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<LearningContentResponse> adminAll() {
        return contentRepository.findAll().stream().map(c -> map(c, false)).toList();
    }

    @Transactional
    public LearningContentResponse create(LearningContentRequest req) {
        LearningContent c = new LearningContent();
        apply(c, req);
        return map(contentRepository.save(c), false);
    }

    @Transactional
    public LearningContentResponse update(Long id, LearningContentRequest req) {
        LearningContent c = contentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        apply(c, req);
        return map(contentRepository.save(c), false);
    }

    @Transactional
    public void delete(Long id) {
        if (!contentRepository.existsById(id)) throw new ResourceNotFoundException("Content not found");
        contentRepository.deleteById(id);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void apply(LearningContent c, LearningContentRequest req) {
        Book b = bookRepository.findById(req.bookId()).orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        c.setBook(b);
        c.setType(req.type());
        c.setTitle(req.title().trim());
        c.setChapter(req.chapter());
        c.setDescription(req.description());
        c.setUrl(req.url().trim());
        c.setThumbnailUrl(req.thumbnailUrl());
        c.setDuration(req.duration());
        c.setPrice(req.price() == null ? BigDecimal.ZERO : req.price());
        c.setActive(req.active() == null || req.active());
    }

    private LearningContentResponse map(LearningContent c, boolean purchased) {
        return new LearningContentResponse(c.getId(), c.getBook().getId(), c.getBook().getTitle(), c.getType(),
                c.getTitle(), c.getChapter(), c.getDescription(), c.getUrl(), c.getThumbnailUrl(), c.getDuration(),
                c.getPrice() == null ? BigDecimal.ZERO : c.getPrice(), purchased, c.isActive(), c.getCreatedAt());
    }
}
