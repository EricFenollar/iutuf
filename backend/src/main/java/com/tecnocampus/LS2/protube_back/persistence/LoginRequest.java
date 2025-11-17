package com.tecnocampus.LS2.protube_back.persistence;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
