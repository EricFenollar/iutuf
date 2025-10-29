package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.persistence.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
    User findByUsername(String username);
}
