package com.tecnocampus.LS2.protube_back.services;


import com.tecnocampus.LS2.protube_back.persistence.LoginRequest;
import com.tecnocampus.LS2.protube_back.persistence.LoginResponse;
import com.tecnocampus.LS2.protube_back.persistence.User;
import com.tecnocampus.LS2.protube_back.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserServiceTest {

    private UserRepository userRepository;
    private UserService userService;
    private BCryptPasswordEncoder encoder;

    @BeforeEach
    void setup() {
        userRepository = mock(UserRepository.class);
        userService = new UserService(userRepository);
        encoder = new BCryptPasswordEncoder();
    }


    @Test
    void testUserExistsTrue() {
        when(userRepository.findById("john"))
                .thenReturn(Optional.of(new User()));

        assertTrue(userService.userExists("john"));
    }

    @Test
    void testUserExistsFalse() {
        when(userRepository.findById("john"))
                .thenReturn(Optional.empty());

        assertFalse(userService.userExists("john"));
    }

    @Test
    void testCreateUserSuccess() {
        User newUser = new User();
        newUser.setUsername("john");
        newUser.setPassword("123456");

        when(userRepository.findById("john"))
                .thenReturn(Optional.empty());
        when(userRepository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.createUser(newUser);

        assertNotNull(result);
        assertNotEquals("123456", result.getPassword()); // password is encoded
        assertTrue(encoder.matches("123456", result.getPassword()));
    }

    @Test
    void testCreateUserAlreadyExists() {
        User existing = new User();
        existing.setUsername("john");

        when(userRepository.findById("john"))
                .thenReturn(Optional.of(existing));

        User newUser = new User();
        newUser.setUsername("john");
        newUser.setPassword("whatever");

        assertThrows(RuntimeException.class, () -> userService.createUser(newUser));
    }

    @Test
    void testLoginSuccess() {
        User savedUser = new User();
        savedUser.setUsername("john");
        savedUser.setPassword(encoder.encode("pass123"));

        when(userRepository.findById("john"))
                .thenReturn(Optional.of(savedUser));

        LoginRequest request = new LoginRequest("john", "pass123");
        LoginResponse response = userService.login(request);

        assertEquals("Login successful", response.getMessage());
    }

    @Test
    void testLoginUserNotFound() {
        when(userRepository.findById("john"))
                .thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("john", "pass123");

        assertThrows(EntityNotFoundException.class, () -> userService.login(request));
    }

    @Test
    void testLoginIncorrectPassword() {
        User savedUser = new User();
        savedUser.setUsername("john");
        savedUser.setPassword(encoder.encode("goodpass"));

        when(userRepository.findById("john"))
                .thenReturn(Optional.of(savedUser));

        LoginRequest request = new LoginRequest("john", "badpass");
        LoginResponse response = userService.login(request);

        assertEquals("Incorrect password", response.getMessage());
    }

    @Test
    void testCheckPasswordMatches() {
        String encoded = encoder.encode("mypassword");
        assertTrue(userService.checkPassword("mypassword", encoded));
    }

    @Test
    void testCheckPasswordDoesNotMatch() {
        String encoded = encoder.encode("mypassword");
        assertFalse(userService.checkPassword("wrongpass", encoded));
    }
}
