package com.tecnocampus.LS2.protube_back.services;

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
    UserService userService;

    @Value("${pro_tube.videos.dir}")
    String videosDir;

    @Value("${pro_tube.thumbnails.dir}")
    String thumbnailsDir;

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
}



