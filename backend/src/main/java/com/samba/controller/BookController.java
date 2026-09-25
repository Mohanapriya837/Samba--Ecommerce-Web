package com.samba.controller;

import com.samba.dto.BookResponse;
import com.samba.dto.PageResponse;
import com.samba.service.BookService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /** Browse + search + filter + sort + paginate. sortBy: title | author | price | createdAt. */
    @GetMapping
    public ResponseEntity<PageResponse<BookResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(bookService.search(keyword, categoryId, minPrice, maxPrice, page, size, sortBy, direction));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> details(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.findById(id));
    }
}
