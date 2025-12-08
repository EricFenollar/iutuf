package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class VideoServiceTest {

    private VideoRepository videoRepository;
    private VideoService videoService;

    @BeforeEach
    void setUp() {
        // 模拟数据库 repository
        videoRepository = Mockito.mock(VideoRepository.class);
        videoService = new VideoService(videoRepository);
    }

    @Test
    void shouldReturnAllVideosFromRepository() {
        // 准备假数据
        Video v1 = new Video();
        v1.setId(Long.valueOf("1"));
        v1.setTitle("Video 1");

        Video v2 = new Video();
        v2.setId(Long.valueOf("2"));
        v2.setTitle("Video 2");

        when(videoRepository.findAll()).thenReturn(List.of(v1, v2));

        // 调用方法
        List<Video> result = videoService.getVideos();

        // 验证
        assertEquals(2, result.size());
        assertEquals("Video 1", result.get(0).getTitle());
        verify(videoRepository, times(1)).findAll();
    }
}
