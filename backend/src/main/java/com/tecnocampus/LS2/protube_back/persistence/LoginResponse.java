package com.tecnocampus.LS2.protube_back.persistence;

import lombok.Data;

@Data
public class LoginResponse {
    private String username;
    private String token;
    private String message;

    public LoginResponse(String username, String token, String message) {
        this.username = username;
        this.token = token;
        this.message = message;
    }
}
