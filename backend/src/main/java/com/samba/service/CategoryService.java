package com.samba.service;

import com.samba.dto.CategoryRequest;
import com.samba.dto.CategoryResponse;
import com.samba.entity.Category;
import com.samba.exception.ConflictException;
import com.samba.exception.ResourceNotFoundException;
import com.samba.mapper.EntityMapper;
import com.samba.repository.BookRepository;
import com.samba.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    public CategoryService(CategoryRepository categoryRepository, BookRepository bookRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAllByOrderByNameAsc().stream().map(EntityMapper::toCategory).toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        return EntityMapper.toCategory(get(id));
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        String name = req.name().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Category '" + name + "' already exists");
        }
        Category c = new Category();
        c.setName(name);
        c.setDescription(req.description());
        return EntityMapper.toCategory(categoryRepository.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = get(id);
        String name = req.name().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Category '" + name + "' already exists");
        }
        c.setName(name);
        c.setDescription(req.description());
        return EntityMapper.toCategory(categoryRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        Category c = get(id);
        if (bookRepository.existsByCategoryId(id)) {
            throw new ConflictException("Cannot delete a category that still has books. Move or remove its books first.");
        }
        categoryRepository.delete(c);
    }

    private Category get(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
    }
}
