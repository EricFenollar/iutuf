package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.persistence.LoginRequest;
import com.tecnocampus.LS2.protube_back.persistence.LoginResponse;
import com.tecnocampus.LS2.protube_back.persistence.User;
import com.tecnocampus.LS2.protube_back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public boolean userExists(String username) {
        return userRepository.findById(username).isPresent();
    }

    public User createUser(User user){
        if (userExists(user.getUsername())){
            throw new RuntimeException("Username is already taken");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request){
        String username = request.getUsername();
        String password = request.getPassword();

        User user = userRepository.findById(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!checkPassword(password, user.getPassword())) {
            return new LoginResponse(username, null, "Incorrect password");
        }

        return new LoginResponse(username, null, "Login successful");
    }

    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
