package com.tecnocampus.LS2.protube_back.repository;

import com.tecnocampus.LS2.protube_back.persistence.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository <Video, Long>{
    List<Video> findByUser(String user);
}
