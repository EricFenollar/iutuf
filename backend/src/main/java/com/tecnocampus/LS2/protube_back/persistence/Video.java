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
    private Long id;

    private String title;

    @Column(name = "user_name")
    private String user;
    private int width;
    private int height;
    private double duration;
    // 让 Hibernate 把 meta 当作 JSON 存储
    // Hacer que Hibernate almacene meta como JSON
    @JdbcTypeCode(SqlTypes.JSON)

    private VideoMeta meta;

    // 视频文件名，比如 0.mp4
    // Nombre del archivo de vídeo, por ejemplo 0.mp4
    private String fileName;
    // 文件完整路径，比如 C:/Users/顺东/Desktop/0.mp4
    // Ruta completa del archivo, por ejemplo C:/Users/顺东/Desktop/0.mp4
    private String path;

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

