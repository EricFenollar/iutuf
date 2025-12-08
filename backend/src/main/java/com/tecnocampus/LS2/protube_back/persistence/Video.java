package com.tecnocampus.LS2.protube_back.persistence;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;


@Data
@Entity
@Table(name = "videos")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "user_name")
    private String user;
    // Hacer que Hibernate almacene meta como JSON
    @JdbcTypeCode(SqlTypes.JSON)
    private VideoMeta meta;

    private int width;
    private int height;
    private double duration;

    private String filePath;
    private String thumbnailPath;

    private  int likeCount = 0;

    private int dislikeCount = 0;
    @ElementCollection
    private Map<String,String> reaction= new HashMap<>();


    public void addComment(Comment comment){
        meta.addComment(comment);
    }
    public String getReaction(String A) {
        return reaction.get(A);
    }
}

