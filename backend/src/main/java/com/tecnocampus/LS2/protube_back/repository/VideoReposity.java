package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.persistence.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoReposity extends JpaRepository <Video, Long>{
}
