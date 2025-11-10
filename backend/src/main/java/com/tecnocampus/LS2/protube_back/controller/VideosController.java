package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.persistence.Comment;
import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/videos")
public class VideosController {

    @Autowired
    VideoService videoService;



    @GetMapping("")
    public ResponseEntity<List<Video>> getVideos() {
        return ResponseEntity.ok().body(videoService.getVideos());

    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getVideoFile(@PathVariable Long id) {
        try {
            //Buscar la entidad de video en la base de datos según su id.
            Video video = videoService.getVideoById(id);

            // Obtener la ruta de almacenamiento del video
            Path videoPath = Paths.get(video.getPath());

            // 3️⃣ Leer el archivo como un recurso (Resource)
            Resource resource = new UrlResource(videoPath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 4️⃣ Devolver el flujo del archivo de video (para que el navegador pueda reproducirlo)
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "video/mp4")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}/info")
    public ResponseEntity<Video> getVideoById(@PathVariable long id){
        return ResponseEntity.ok().body(videoService.getVideoById(id));
    }

    @GetMapping("/thumbnail/{id}")
    public ResponseEntity<Resource> getThumbnailFile(@PathVariable Long id){
        try {
            // 1️⃣ 从数据库根据 id 找到视频实体
            // 1️⃣ Buscar la entidad de video en la base de datos según su id

            Video video = videoService.getVideoById(id);

            // 2️⃣ 获取视频的存储路径
            // 2️⃣ Obtener la ruta de almacenamiento del video
            Path thumbnailPath = Paths.get(videoService.getThumbnailById(id));

            // 3️⃣ 把文件读成 Resource
            // 3️⃣ Leer el archivo como un recurso (Resource)

            Resource resource = new UrlResource(thumbnailPath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 4️⃣ 返回视频文件流（让浏览器能播放）
            // 4️⃣ Devolver el flujo del archivo de video (para que el navegador pueda reproducirlo)
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "image/webp")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Comment comment) {
        Video video = videoService.getVideoById(id);
        video.addComment(comment);
        videoService.saveVideo(video);
        return ResponseEntity.ok().body("Comment successful");
    }


}
