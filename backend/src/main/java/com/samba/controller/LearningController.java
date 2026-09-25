package com.samba.controller;

import com.samba.dto.LearningContentResponse;
import com.samba.dto.LearningPurchaseResponse;
import com.samba.service.LearningContentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/learning")
public class LearningController {
    private final LearningContentService service;
    public LearningController(LearningContentService service) { this.service = service; }

    @GetMapping("/catalog")
    public ResponseEntity<List<LearningContentResponse>> catalog(Authentication auth,
                                                                  @RequestParam(required = false) Long bookId) {
        return ResponseEntity.ok(service.catalog(auth.getName(), bookId));
    }

    @GetMapping("/purchased")
    public ResponseEntity<List<LearningContentResponse>> purchased(Authentication auth) {
        return ResponseEntity.ok(service.purchased(auth.getName()));
    }

    @PostMapping("/{contentId}/purchase")
    public ResponseEntity<LearningPurchaseResponse> purchase(Authentication auth,
                                                             @PathVariable Long contentId,
                                                             @RequestParam(defaultValue = "ONLINE") String paymentMethod) {
        return ResponseEntity.ok(service.purchase(auth.getName(), contentId, paymentMethod));
    }
}
