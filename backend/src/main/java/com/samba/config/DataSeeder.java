package com.samba.config;

import com.samba.entity.*;
import com.samba.repository.BookRepository;
import com.samba.repository.CategoryRepository;
import com.samba.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}")
    private String adminName;
    @Value("${app.admin.email}")
    private String adminEmail;
    @Value("${app.admin.password}")
    private String adminPassword;
    @Value("${app.seed.sample-data}")
    private boolean seedSampleData;

    public DataSeeder(UserRepository userRepository, CategoryRepository categoryRepository,
                      BookRepository bookRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        if (seedSampleData && categoryRepository.count() == 0) {
            seedCatalogue();
        }
    }

    private void seedAdmin() {
        String email = adminEmail.trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User admin = new User();
        admin.setFullName(adminName);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.attachCart(new Cart());
        userRepository.save(admin);
        log.warn("Default ADMIN created: {} - change ADMIN_PASSWORD / the password before deploying!", email);
    }

    private void seedCatalogue() {
        Map<String, Category> cats = new LinkedHashMap<>();
        String[][] categoryData = {
                {"Fiction", "Novels and short stories"},
                {"Non-Fiction", "History, science and real-world narratives"},
                {"Technology", "Programming, software engineering and computing"},
                {"Self-Help", "Personal growth and productivity"},
                {"Children", "Books for young readers"}
        };
        for (String[] c : categoryData) {
            Category category = new Category();
            category.setName(c[0]);
            category.setDescription(c[1]);
            cats.put(c[0], categoryRepository.save(category));
        }

        addBook("Clean Code", "Robert C. Martin", "9780132350884", "A handbook of agile software craftsmanship.", "34.99", 25, "Prentice Hall", cats.get("Technology"));
        addBook("Effective Java", "Joshua Bloch", "9780134685991", "Best practices for the Java platform.", "39.99", 18, "Addison-Wesley", cats.get("Technology"));
        addBook("The Alchemist", "Paulo Coelho", "9780062315007", "A shepherd's journey in pursuit of his dream.", "14.99", 40, "HarperOne", cats.get("Fiction"));
        addBook("1984", "George Orwell", "9780451524935", "A dystopian novel about surveillance and control.", "9.99", 60, "Signet Classics", cats.get("Fiction"));
        addBook("To Kill a Mockingbird", "Harper Lee", "9780061120084", "A classic of justice and race in the American South.", "12.99", 35, "Harper Perennial", cats.get("Fiction"));
        addBook("Sapiens", "Yuval Noah Harari", "9780062316110", "A brief history of humankind.", "18.99", 30, "Harper", cats.get("Non-Fiction"));
        addBook("Atomic Habits", "James Clear", "9780735211292", "Tiny changes, remarkable results.", "16.99", 50, "Avery", cats.get("Self-Help"));
        addBook("The Little Prince", "Antoine de Saint-Exupery", "9780156012195", "A poetic tale of a young prince who travels the universe.", "8.99", 45, "Harcourt", cats.get("Children"));
        log.info("Sample catalogue seeded: {} categories, {} books", categoryRepository.count(), bookRepository.count());
    }

    private void addBook(String title, String author, String isbn, String description, String price, int stock,
                         String publisher, Category category) {
        Book b = new Book();
        b.setTitle(title);
        b.setAuthor(author);
        b.setIsbn(isbn);
        b.setDescription(description);
        b.setPrice(new BigDecimal(price));
        b.setStock(stock);
        b.setPublisher(publisher);
        b.setCategory(category);
        bookRepository.save(b);
    }
}
