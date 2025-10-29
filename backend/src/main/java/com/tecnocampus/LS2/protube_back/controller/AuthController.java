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
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        if(!userService.existsByUsername(request.getUsername())){
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
        return ResponseEntity.ok().body("User registered successfully");
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(){
       //Todo:
        return null;
    }
}
