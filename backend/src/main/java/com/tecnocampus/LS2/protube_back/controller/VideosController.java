package com.tecnocampus.LS2.protube_back.controller;

import com.tecnocampus.LS2.protube_back.persistence.Comment;
import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.persistence.VideoMeta;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

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


    @PostMapping("/{id}/like")
    public Video likeVideo(@PathVariable Long id, @RequestParam String username) {
        return videoService.reactLike(id, username);
    }

    @PostMapping("/{id}/dislike")
    public Video dislikeVideo(@PathVariable Long id, @RequestParam String username) {
        return videoService.reactDislike(id, username);
    }
    public ResponseEntity<?> VideoUpload (
            @RequestParam MultipartFile file, @RequestParam String username,
            @RequestParam String title, @RequestParam String description){
        try{
            if(file == null||file.isEmpty()){
                throw new RuntimeException("El EXCEPTION IS NULL");
            }
            // 2. 生成文件名和保存路径
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path savePath = Paths.get("videos").resolve(fileName);
            //如果Videos文件夹不存在直接建造一个新的
            Files.createDirectories(savePath.getParent());
            //保存文件到磁盘
            file.transferTo(savePath.toFile());
            //创建实体
            Video V = new Video();


            // ⚠️ 如果你没有 @GeneratedValue，必须手动设置 id
            V.setId(System.currentTimeMillis());

            V.setTitle(title);
            V.setUser(username);
            V.setPath(savePath.toString());

            VideoMeta meta = new VideoMeta();
            meta.setDescription(description);
            V.setMeta(meta);

            Video saved = videoService.saveVideo(V);
            return ResponseEntity.ok().body(saved);
        }catch(Exception e){
            throw new RuntimeException("Error al subir video: " + e.getMessage());
        }
    }


}
