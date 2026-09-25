package com.samba.service;

import com.samba.dto.CartResponse;
import com.samba.entity.Book;
import com.samba.entity.Cart;
import com.samba.entity.CartItem;
import com.samba.entity.User;
import com.samba.exception.BadRequestException;
import com.samba.exception.ConflictException;
import com.samba.exception.ResourceNotFoundException;
import com.samba.mapper.EntityMapper;
import com.samba.repository.BookRepository;
import com.samba.repository.CartItemRepository;
import com.samba.repository.CartRepository;
import com.samba.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       BookRepository bookRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CartResponse getCart(String email) {
        return EntityMapper.toCart(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse addItem(String email, Long bookId, int quantity) {
        Book book = bookRepository.findByIdAndActiveTrue(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id " + bookId));
        Cart cart = getOrCreateCart(email);
        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getBook().getId().equals(bookId)).findFirst().orElse(null);

        int newQty = (existing == null ? 0 : existing.getQuantity()) + quantity;
        checkStock(book, newQty);

        if (existing == null) {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setBook(book);
            item.setQuantity(newQty);
            try {
                // flush immediately so a duplicate row (two simultaneous "add" requests for the
                // same book) is caught here as a clear 409, instead of surfacing later as a
                // confusing generic constraint error at transaction commit.
                cartItemRepository.saveAndFlush(item);
            } catch (DataIntegrityViolationException ex) {
                throw new ConflictException(
                        "'" + book.getTitle() + "' was just added to your cart in another request. Please refresh your cart and try again.");
            }
            cart.getItems().add(item);
        } else {
            existing.setQuantity(newQty);
        }
        return EntityMapper.toCart(cart);
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, int quantity) {
        Cart cart = getOrCreateCart(email);
        CartItem item = findItem(cart, itemId);
        checkStock(item.getBook(), quantity);
        item.setQuantity(quantity);
        return EntityMapper.toCart(cart);
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        Cart cart = getOrCreateCart(email);
        CartItem item = findItem(cart, itemId);
        cart.getItems().remove(item); // orphanRemoval deletes the row
        return EntityMapper.toCart(cart);
    }

    @Transactional
    public CartResponse clear(String email) {
        Cart cart = getOrCreateCart(email);
        cart.getItems().clear();
        return EntityMapper.toCart(cart);
    }

    private void checkStock(Book book, int requested) {
        if (!book.isActive()) {
            throw new BadRequestException("'" + book.getTitle() + "' is no longer available");
        }
        if (requested > book.getStock()) {
            throw new BadRequestException("Only " + book.getStock() + " copies of '" + book.getTitle() + "' available");
        }
    }

    private CartItem findItem(Cart cart, Long itemId) {
        return cart.getItems().stream().filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id " + itemId));
    }

    private Cart getOrCreateCart(String email) {
        return cartRepository.findByUserEmail(email).orElseGet(() -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }
}
