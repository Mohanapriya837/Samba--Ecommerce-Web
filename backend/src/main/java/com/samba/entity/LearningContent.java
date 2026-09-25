package com.samba.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "learning_content")
public class LearningContent extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LearningContentType type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 120)
    private String chapter;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(length = 30)
    private String duration;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;
}
