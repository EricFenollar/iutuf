package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.persistence.User;
import com.tecnocampus.LS2.protube_back.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean existsByUsername(String username) {
        return userRepository.findByUsername(username) != null;// Placeholder return statement
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }
}
