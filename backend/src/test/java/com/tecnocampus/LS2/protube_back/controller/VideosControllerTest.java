package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.persistence.video;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VideosControllerTest {

    @InjectMocks
    private VideosController videosController;

    @Mock
    private VideoService videoService;

    @Test
    void getVideos_ShouldReturnListOfVideos() {
        // 1️⃣ 创建假数据
        video v1 = new video();
        v1.setId(Long.valueOf("1"));
        v1.setTitle("Video 1");

        video v2 = new video();
        v2.setId(Long.valueOf("2"));
        v2.setTitle("Video 2");

        List<video> fakeVideos = List.of(v1, v2);

        // 2️⃣ 模拟 videoService 返回假数据
        when(videoService.getVideos()).thenReturn(fakeVideos);

        // 3️⃣ 调用控制器方法
        ResponseEntity<List<video>> response = videosController.getVideos();

        // 4️⃣ 验证结果
        assertEquals(200, response.getStatusCode().value());
        assertEquals(2, Objects.requireNonNull(response.getBody()).size());
        assertEquals("Video 1", response.getBody().getFirst().getTitle());
    }
}
