package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.persistence.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUsername(String username);
}
