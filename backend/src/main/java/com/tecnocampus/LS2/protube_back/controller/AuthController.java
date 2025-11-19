package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.persistence.LoginRequest;
import com.tecnocampus.LS2.protube_back.persistence.User;
import com.tecnocampus.LS2.protube_back.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user){
        if(userService.existsByUsername(user.getUsername())){
            return ResponseEntity.badRequest().body("Username is already taken");
        }
        userService.saveUser(user);
        return ResponseEntity.ok().body("User registered successfully");
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // 1️⃣ Find user by username
        User existingUser = userService.findByUsername(request.getUsername());
        if (existingUser == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        // 2️⃣ Compare password (plain text vs encrypted one)
        boolean match = userService.checkPassword(
                request.getPassword(),
                existingUser.getPassword()
        );

        // 3️⃣ Handle incorrect password
        if (!match) {
            return ResponseEntity.status(401).body("Incorrect password");
        }

        // 4️⃣ Successful login
        return ResponseEntity.ok("Login successful ");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(){
       //Todo:
        return null;
    }
}
