package com.tecnocampus.LS2.protube_back.persistence;


import lombok.Data;

@Data
public class Comment {
    private String text;
    private String author;

    public Comment(String user, String text) {
        this.author = user;
        this.text = text;
    }
}
