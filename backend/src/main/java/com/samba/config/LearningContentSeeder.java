package com.samba.config;

import com.samba.entity.Book;
import com.samba.entity.LearningContent;
import com.samba.entity.LearningContentType;
import com.samba.repository.BookRepository;
import com.samba.repository.LearningContentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Component
public class LearningContentSeeder implements CommandLineRunner {
    private final LearningContentRepository contentRepository;
    private final BookRepository bookRepository;
    public LearningContentSeeder(LearningContentRepository contentRepository, BookRepository bookRepository) {
        this.contentRepository = contentRepository; this.bookRepository = bookRepository;
    }

    @Override @Transactional
    public void run(String... args) {
        Book book = bookRepository.findAll().stream().findFirst().orElse(null);
        if (book == null) return;

        if (!contentRepository.findAll().stream().anyMatch(c -> c.getTitle().equals("Welcome lesson · Demo video"))) {
            LearningContent c = new LearningContent();
            c.setBook(book); c.setType(LearningContentType.VIDEO);
            c.setTitle("Welcome lesson · Demo video"); c.setChapter("Getting started");
            c.setDescription("A working sample lesson. Replace this URL from Admin → Learning with your own lesson.");
            c.setUrl("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4");
            c.setDuration("2 min"); c.setPrice(new BigDecimal("49.00")); c.setActive(true);
            contentRepository.save(c);
        }

        if (!contentRepository.findAll().stream().anyMatch(c -> c.getTitle().equals("Introduction to Addition"))) {
            LearningContent c = new LearningContent();
            c.setBook(book); c.setType(LearningContentType.VIDEO);
            c.setTitle("Introduction to Addition"); c.setChapter("Early Math");
            c.setDescription("Khan Academy Early Math lesson. External video hosted on YouTube.");
            c.setUrl("https://www.youtube.com/watch?v=fsTD_jqseBA");
            c.setDuration("5 min"); c.setPrice(new BigDecimal("49.00")); c.setActive(true);
            contentRepository.save(c);
        }

        if (!contentRepository.findAll().stream().anyMatch(c -> c.getTitle().equals("Photosynthesis — Light and Dark Reactions"))) {
            LearningContent c = new LearningContent();
            c.setBook(book); c.setType(LearningContentType.VIDEO);
            c.setTitle("Photosynthesis — Light and Dark Reactions"); c.setChapter("Life Science");
            c.setDescription("Khan Academy India educational video. External video hosted on YouTube.");
            c.setUrl("https://www.youtube.com/watch?v=I1DDcZhG6P8");
            c.setDuration("5 min"); c.setPrice(new BigDecimal("79.00")); c.setActive(true);
            contentRepository.save(c);
        }
    }
}
