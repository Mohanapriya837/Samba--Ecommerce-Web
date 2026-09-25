package com.samba.service;

import com.samba.dto.BookRequest;
import com.samba.dto.BookResponse;
import com.samba.dto.PageResponse;
import com.samba.dto.StockUpdateRequest;
import com.samba.entity.Book;
import com.samba.entity.Category;
import com.samba.exception.BadRequestException;
import com.samba.exception.ConflictException;
import com.samba.exception.ResourceNotFoundException;
import com.samba.mapper.EntityMapper;
import com.samba.repository.BookRepository;
import com.samba.repository.BookSpecifications;
import com.samba.repository.CartItemRepository;
import com.samba.repository.CategoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

@Service
public class BookService {

    private static final Set<String> SORT_FIELDS = Set.of("title", "author", "price", "createdAt");

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final CartItemRepository cartItemRepository;

    public BookService(BookRepository bookRepository, CategoryRepository categoryRepository,
                       CartItemRepository cartItemRepository) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<BookResponse> search(String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                             int page, int size, String sortBy, String direction) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("minPrice cannot be greater than maxPrice");
        }
        String field = SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(dir, field, "id"));
        return PageResponse.of(
                bookRepository.findAll(BookSpecifications.filter(keyword, categoryId, minPrice, maxPrice), pageable),
                EntityMapper::toBook);
    }

    @Transactional(readOnly = true)
    public BookResponse findById(Long id) {
        return EntityMapper.toBook(getActive(id));
    }

    @Transactional
    public BookResponse create(BookRequest req) {
        String isbn = normalizeIsbn(req.isbn());
        if (isbn != null && bookRepository.existsByIsbn(isbn)) {
            throw new ConflictException("A book with ISBN " + isbn + " already exists");
        }
        Book book = new Book();
        apply(book, req, isbn);
        return EntityMapper.toBook(bookRepository.save(book));
    }

    @Transactional
    public BookResponse update(Long id, BookRequest req) {
        Book book = getActive(id);
        String isbn = normalizeIsbn(req.isbn());
        if (isbn != null && bookRepository.existsByIsbnAndIdNot(isbn, id)) {
            throw new ConflictException("A book with ISBN " + isbn + " already exists");
        }
        apply(book, req, isbn);
        return EntityMapper.toBook(bookRepository.save(book));
    }

    @Transactional
    public BookResponse updateStock(Long id, StockUpdateRequest req) {
        Book book = getActive(id);
        book.setStock(req.stock());
        return EntityMapper.toBook(bookRepository.save(book));
    }

    /** Soft delete: keeps order history intact, removes the book from catalogue and from all carts. */
    @Transactional
    public void delete(Long id) {
        cartItemRepository.deleteByBookId(id); // clears persistence context, so load the book afterwards
        Book book = getActive(id);
        book.setActive(false);
        bookRepository.save(book);
    }

    private void apply(Book book, BookRequest req, String isbn) {
        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + req.categoryId()));
        book.setTitle(req.title().trim());
        book.setAuthor(req.author().trim());
        book.setIsbn(isbn);
        book.setDescription(req.description());
        book.setPrice(req.price());
        book.setStock(req.stock());
        book.setImageUrl(req.imageUrl());
        book.setPublisher(req.publisher());
        book.setCategory(category);
    }

    private String normalizeIsbn(String isbn) {
        return (isbn == null || isbn.isBlank()) ? null : isbn.trim();
    }

    private Book getActive(Long id) {
        return bookRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + id));
    }
}
