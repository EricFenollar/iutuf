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
    @PostMapping("/upload")
    public ResponseEntity<?> videoUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("username") String username,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description
    ) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is null or empty");
            }

            // 允许 description 为 null
            if (description == null) description = "";

            // 1. 保存目录
            Path root = Paths.get("C:/videos");
            Files.createDirectories(root);

            // 2. 生成视频文件名
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            /*String original = file.getOriginalFilename();
            String ext = original.substring(original.lastIndexOf("."));     // 自动获取扩展名
            String fileName = UUID.randomUUID() + ext;*/
            Path savePath = root.resolve(fileName);

            // 3. 保存视频文件
            file.transferTo(savePath.toFile());

            // =======================
            // 🌟 自动生成缩略图
            // =======================

            // 缩略图固定为 webp
            /*String thumbnailName = fileName.substring(0, fileName.lastIndexOf(".")) + ".webp";
            Path thumbPath = root.resolve(thumbnailName);

            // ffmpeg 命令（稳定版）
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y",
                    "-i", savePath.toString(),
                    "-ss", "00:00:01",         // 截取第 1 秒
                    "-vframes", "1",           // 截一张图
                    "-vf", "scale=320:-1",     // 缩略图大小（保持比例）
                    thumbPath.toString()
            );

            pb.redirectErrorStream(true);
            Process process = pb.start();
            process.waitFor();

            if (!thumbPath.toFile().exists()) {
                throw new RuntimeException("Thumbnail generation failed");
            }*/

            // =======================
            // 保存视频信息
            // =======================

            Video v = new Video();
            v.setId(System.currentTimeMillis());
            v.setTitle(title);
            v.setUser(username);
            v.setPath(savePath.toString());

            VideoMeta meta = new VideoMeta();
            meta.setDescription(description);
            //meta.setThumbnail(thumbPath.toString());   // 设置缩略图路径
            v.setMeta(meta);

            Video saved = videoService.saveVideo(v);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error uploading video: " + e.getMessage());
        }
    }





}
