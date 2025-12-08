package com.tecnocampus.LS2.protube_back.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tecnocampus.LS2.protube_back.persistence.Comment;
import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.persistence.VideoMeta;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@Service
public class VideoService {

    private final VideoRepository videoRepository;

    @Autowired
    private UserService userService;

    @Value("${pro_tube.videos.dir}")
    private String videosDir;

    @Value("${pro_tube.thumbnails.dir}")
    private String thumbnailsDir;

    public VideoService(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    public Video getVideo(Long id){
        return videoRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Video not found"));
    }

    public List<Video> getVideos() {
        return videoRepository.findAll();
    }

    public Resource getVideoFile(Long id){
        try {
            Video video = videoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Video not found"));

            Path path = Paths.get(video.getFilePath());
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("Video file not found");
            }

            return resource; // Devuelve solo el Resource, sin ResponseEntity
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener recurso de video", e);
        }
    }

    public Resource getVideoThumbnail(Long id){
        try {
            Video video = videoRepository.findById(id)
                    .orElseThrow(()->new RuntimeException("Video not found"));

            Path thumbnailPath = Paths.get(video.getThumbnailPath());

            Resource resource = new UrlResource(thumbnailPath.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("Thumbnail not found");
            }

            return resource;

        } catch (Exception e) {
            throw new RuntimeException("Error while obtaining thumbnail", e);
        }
    }

    public List<Video> getVideosByUser(String username){
        return videoRepository.findByUser(username);
    }

    public Video uploadVideo(MultipartFile file, String title, String description,
                             MultipartFile thumbnail, String username, List<String> tags,
                             List<String> categories) {
        try {
            String videoFilename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path videoPath = Paths.get(videosDir, videoFilename);
            Files.createDirectories(videoPath.getParent());
            Files.copy(file.getInputStream(), videoPath, StandardCopyOption.REPLACE_EXISTING);

            String thumbnailFilename = System.currentTimeMillis() + ".webp";
            Path thumbnailPath = Paths.get(thumbnailsDir, thumbnailFilename);
            Files.createDirectories(thumbnailPath.getParent());

            Files.copy(thumbnail.getInputStream(), thumbnailPath, StandardCopyOption.REPLACE_EXISTING);

            VideoMeta meta = new VideoMeta();
            meta.setDescription(description);
            meta.setTags(tags != null ? tags : new ArrayList<>());
            meta.setCategories(categories != null ? categories : new ArrayList<>());
            meta.setComments(new ArrayList<>());

            Video video = new Video();
            video.setTitle(title);
            video.setFilePath(videoPath.toString());
            video.setThumbnailPath(thumbnailPath.toString());
            video.setUser(username);
            video.setMeta(meta);

            return videoRepository.save(video);

        } catch (Exception e){
            throw new RuntimeException("Error while saving video", e);
        }
    }

    public Video addComment(Long videoId, Comment comment) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video no encontrado"));

        if (video.getMeta() == null) {
            video.setMeta(new VideoMeta());
            video.getMeta().setComments(new ArrayList<>());
        }

        video.getMeta().getComments().add(comment);

        return videoRepository.save(video);
    }

    public Video reactLike(Long videoId, String username) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null)
            return null;

        String evaluacion = video.getReaction(username);

        if (evaluacion != null && evaluacion.equals("like")) {
            video.setLikeCount(video.getLikeCount() - 1);
            video.getReaction().remove(username);
        } else if (evaluacion != null && evaluacion.equals("dislike")) {
            video.setDislikeCount(video.getDislikeCount() - 1);
            video.setLikeCount(video.getLikeCount() + 1);
            video.getReaction().put(username, "like");
        } else {
            video.setLikeCount(video.getLikeCount() + 1);
            video.getReaction().put(username, "like");
        }
        videoRepository.save(video);
        return video;
    }
    public Video reactDislike(Long videoId, String username) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null)
            return null;

        String evaluacion = video.getReaction().get(username);

        if (evaluacion != null && evaluacion.equals("dislike")) {
            video.setDislikeCount(video.getDislikeCount() - 1);
            video.getReaction().remove(username);

        } else if (evaluacion != null && evaluacion.equals("like")) {
            video.setLikeCount(video.getLikeCount() - 1);
            video.setDislikeCount(video.getDislikeCount() + 1);
            video.getReaction().put(username, "dislike");

        } else {
            video.setDislikeCount(video.getDislikeCount() + 1);
            video.getReaction().put(username, "dislike");
        }
        videoRepository.save(video);
        return video;
    }

    /*public void importInitialVideos(String initialVideosDir){
        File folder = new File(initialVideosDir);

        if (!folder.exists()) {
            System.out.println("❌ initial_videos no existe, nada que importar.");
            return;
        }

        File[] files = folder.listFiles((dir, name) -> name.endsWith(".mp4"));
        if (files == null) return;

        for (File videoFile : files) {
            try {
                String baseName = videoFile.getName().replace(".mp4", "");

                File metaFile = new File(folder, baseName + ".json");
                File thumbFile = new File(folder, baseName + ".webp");

                if (!metaFile.exists()) {
                    System.out.println("⚠️ Falta metadata para " + baseName);
                    continue;
                }

                // Leer metadata
                ObjectMapper mapper = new ObjectMapper();
                VideoMeta meta = mapper.readValue(metaFile, VideoMeta.class);

                // Crear usuario si no existe
                String username = meta.get();
                userService.createUserIfNotExists(username);

                // Generar nuevo nombre aleatorio
                String newVideoName = UUID.randomUUID().toString() + ".mp4";
                String newThumbName = UUID.randomUUID().toString() + ".webp";

                // Copiar archivos al directorio final
                Path newVideoPath = Paths.get(videosDir, newVideoName);
                Path newThumbPath = Paths.get(thumbnailsDir, newThumbName);

                Files.copy(videoFile.toPath(), newVideoPath, StandardCopyOption.REPLACE_EXISTING);

                if (thumbFile.exists()) {
                    Files.copy(thumbFile.toPath(), newThumbPath, StandardCopyOption.REPLACE_EXISTING);
                }

                // Crear entidad Video
                Video video = new Video();
                video.setUser(username);
                video.setTitle(meta.getTitle());
                video.setDescription(meta.getDescription());
                video.setVideoPath(newVideoPath.toString());
                video.setThumbnailPath(newThumbPath.toString());
                video.setMeta(meta);

                videoRepository.save(video);

                System.out.println("✅ Video importado: " + video.getTitle());

            } catch (Exception e) {
                System.out.println("❌ Error importando video: " + e.getMessage());
            }
        }
    }

    private String getBaseName(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex == -1 ? filename : filename.substring(0, dotIndex);
    }*/
}



