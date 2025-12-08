package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.persistence.Comment;
import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.persistence.VideoMeta;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.io.TempDir;

import org.mockito.Mockito;
import static org.mockito.Mockito.*;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.nio.file.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class VideoServiceTest {

    private VideoRepository videoRepository;
    private UserService userService;
    private VideoService videoService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setup() {
        videoRepository = mock(VideoRepository.class);
        userService = mock(UserService.class);

        videoService = new VideoService(videoRepository);
        videoService.userService = userService;

        videoService.videosDir = tempDir.resolve("videos").toString();
        videoService.thumbnailsDir = tempDir.resolve("thumbs").toString();
    }

    @Test
    void testGetVideoFound() {
        Video video = new Video();
        video.setId(1L);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(video));

        Video result = videoService.getVideo(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetVideoNotFound() {
        when(videoRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> videoService.getVideo(1L));
    }

    @Test
    void testGetVideos() {
        Video v1 = new Video(); v1.setId(1L);
        Video v2 = new Video(); v2.setId(2L);

        when(videoRepository.findAll()).thenReturn(List.of(v1, v2));

        List<Video> list = videoService.getVideos();
        assertEquals(2, list.size());
    }

    @Test
    void testGetVideoFile() throws Exception {
        Path file = tempDir.resolve("video.mp4");
        Files.writeString(file, "dummy video");

        Video video = new Video();
        video.setId(1L);
        video.setFilePath(file.toString());

        when(videoRepository.findById(1L)).thenReturn(Optional.of(video));

        Resource resource = videoService.getVideoFile(1L);

        assertTrue(resource.exists());
        assertEquals(file.toUri(), resource.getURI());
    }

    @Test
    void testGetVideoFileNotFound() {
        Video video = new Video();
        video.setId(1L);
        video.setFilePath("nonexistent.mp4");

        when(videoRepository.findById(1L)).thenReturn(Optional.of(video));

        assertThrows(RuntimeException.class, () -> videoService.getVideoFile(1L));
    }

    @Test
    void testGetVideoThumbnail() throws Exception {
        Path file = tempDir.resolve("thumb.webp");
        Files.writeString(file, "dummy thumb");

        Video video = new Video();
        video.setId(1L);
        video.setThumbnailPath(file.toString());

        when(videoRepository.findById(1L)).thenReturn(Optional.of(video));

        Resource resource = videoService.getVideoThumbnail(1L);
        assertTrue(resource.exists());
    }

    @Test
    void testGetVideosByUser() {
        Video v = new Video();
        v.setUser("john");

        when(videoRepository.findByUser("john")).thenReturn(List.of(v));

        List<Video> result = videoService.getVideosByUser("john");
        assertEquals(1, result.size());
        assertEquals("john", result.get(0).getUser());
    }

    @Test
    void testUploadVideo() throws Exception {
        // Simular archivos
        MockMultipartFile mockVideo = new MockMultipartFile(
                "file", "test.mp4", "video/mp4", "dummy video".getBytes()
        );

        MockMultipartFile mockThumb = new MockMultipartFile(
                "thumbnail", "test.webp", "image/webp", "dummy thumb".getBytes()
        );

        Video savedVideo = new Video();
        savedVideo.setId(10L);
        when(videoRepository.save(any())).thenReturn(savedVideo);

        Video result = videoService.uploadVideo(
                mockVideo,
                "Test video",
                "Description",
                mockThumb,
                "john",
                List.of("tag1", "tag2"),
                List.of("cat1")
        );

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(videoRepository, times(1)).save(any());
    }

    @Test
    void testAddComment() {
        Video video = new Video();
        VideoMeta meta = new VideoMeta();
        meta.setComments(new ArrayList<>());
        video.setMeta(meta);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(video));
        when(videoRepository.save(video)).thenReturn(video);

        Comment comment = new Comment("user", "Nice!");

        Video updated = videoService.addComment(1L, comment);

        assertEquals(1, updated.getMeta().getComments().size());
    }

    @Test
    void testReactLike() {
        Video v = new Video();
        v.setReaction(new HashMap<>());
        v.setLikeCount(0);
        v.setDislikeCount(0);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(v));
        when(videoRepository.save(v)).thenReturn(v);

        Video updated = videoService.reactLike(1L, "john");

        assertEquals(1, updated.getLikeCount());
        assertEquals("like", updated.getReaction().get("john"));
    }

    @Test
    void testReactDislike() {
        Video v = new Video();
        v.setReaction(new HashMap<>());
        v.setLikeCount(0);
        v.setDislikeCount(0);

        when(videoRepository.findById(1L)).thenReturn(Optional.of(v));
        when(videoRepository.save(v)).thenReturn(v);

        Video updated = videoService.reactDislike(1L, "john");

        assertEquals(1, updated.getDislikeCount());
        assertEquals("dislike", updated.getReaction().get("john"));
    }
}
