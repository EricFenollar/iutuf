package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.persistence.Comment;
import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    VideoService videoService;

    @GetMapping("")
    public ResponseEntity<List<Video>> getVideos() {
        return ResponseEntity.ok().body(videoService.getVideos());
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getVideoFile(@PathVariable Long id) {
        try {
            Resource resource = videoService.getVideoFile(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "video/mp4")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Video> getVideo(@PathVariable Long id){
        if (videoService.getVideo(id) != null)
            return ResponseEntity.ok().body(videoService.getVideo(id));
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<Resource> getThumbnailFile(@PathVariable Long id){
        try{
            Resource resource = videoService.getVideoThumbnail(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "image/webp")
                    .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<Video>> getVideosByUser(@PathVariable String username) {
        List<Video> videos = videoService.getVideosByUser(username);
        if (videos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(videos);
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<Video> addComment(@PathVariable Long id, @RequestBody Comment comment) {
        Video updatedVideo = videoService.addComment(id, comment);
        return ResponseEntity.ok(updatedVideo);
    }


    @PostMapping("/{id}/like")
    public Video likeVideo(@PathVariable Long id, @RequestParam String username) {
        return videoService.reactLike(id, username);
    }

    @PostMapping("/{id}/dislike")
    public Video dislikeVideo(@PathVariable Long id, @RequestParam String username) {
        return videoService.reactDislike(id, username);
    }
    @PostMapping("/upload")
    public ResponseEntity<?> videoUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile thumbnail,
            @RequestParam String username,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) List<String> categories
    ) {
        Video video = videoService.uploadVideo(file, title, description, thumbnail, username, tags, categories);
        return ResponseEntity.ok(video);
    }
}
