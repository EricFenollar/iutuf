package com.tecnocampus.LS2.protube_back.persistence;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class VideoMeta {
    private String description;
    private List<String> categories;
    private List<String> tags;
    private List<Comment> comments;

    public void addComment(Comment comment){
        comments.add(comment);
    }
}
