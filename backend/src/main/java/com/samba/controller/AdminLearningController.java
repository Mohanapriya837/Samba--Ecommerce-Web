package com.samba.controller;

import com.samba.dto.LearningContentRequest;
import com.samba.dto.LearningContentResponse;
import com.samba.service.LearningContentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/learning")
public class AdminLearningController {
    private final LearningContentService service;
    public AdminLearningController(LearningContentService service) { this.service = service; }

    @GetMapping public ResponseEntity<List<LearningContentResponse>> all() { return ResponseEntity.ok(service.adminAll()); }
    @PostMapping public ResponseEntity<LearningContentResponse> create(@Valid @RequestBody LearningContentRequest req) { return ResponseEntity.ok(service.create(req)); }
    @PutMapping("/{id}") public ResponseEntity<LearningContentResponse> update(@PathVariable Long id, @Valid @RequestBody LearningContentRequest req) { return ResponseEntity.ok(service.update(id, req)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
