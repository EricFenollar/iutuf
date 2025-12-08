package com.tecnocampus.LS2.protube_back.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import jakarta.persistence.*;
@Data
@Entity
@Table(name="Users")
public class User {
    @Id
    private String username;
    private String password;
    private String email;
}
