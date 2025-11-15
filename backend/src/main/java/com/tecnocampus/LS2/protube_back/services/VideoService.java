package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.repository.videoReposity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class VideoService {

    private final videoReposity videoRepository;

    @Value("${pro_tube.store.dir:C:/videos}")
    private String videoDir;

    public VideoService(videoReposity videoRepository) {
        this.videoRepository = videoRepository;
    }

    public List<Video> getVideos() {

        return videoRepository.findAll();
    }


    public Video getVideoById(Long id) {
        //使用findByID从Repository获取视频，如果找不到返回一个404的错误，也就是异常
        //Usar findBYiD para obener el vídeo del reposity,si no se encyentra , devolver un error 404
        Video v = videoRepository.findById(Long.valueOf(String.valueOf(id)))
                .orElseThrow(() -> new RuntimeException("Video not found"));

        // 如果数据库中没有路径，就自动补上
        //Si no hay una ruta en la base de datos, se añade automáticamente
        if (v.getPath() == null || v.getPath().isEmpty()) {
            if (v.getFileName() != null && !v.getFileName().isEmpty()) {
                v.setPath(videoDir + "/" + v.getFileName());
            } else {
                v.setPath(videoDir + "/" + id + ".mp4");
            }
        }
        return v;
    }
    public String getThumbnailById(Long id){
        Video v=  videoRepository.findById(Long.valueOf(String.valueOf(id))).orElseThrow(()->new RuntimeException("Video not found"));
        if(v.getPath()==null||v.getPath().isEmpty()){
            if(v.getFileName()!=null&&!v.getFileName().isEmpty()){
                return videoDir+"/"+v.getFileName()+".png";
            }else{
                return videoDir+"/"+id+".png";
            }
        }
        return v.getPath().replace(".mp4", ".webp");
    }

    public void saveVideo(Video video){
        videoRepository.save(video);
    }

    public int findByIdDislikes(Long id) {
        Video video= videoRepository.findById(id).orElse(null);
        if(video== null)
            return 0;
        return video.getDislikeCount();

    }

    public int findByIdlikes(long id) {
        Video video = videoRepository.findById(id).orElse(null);
        if(video==null)
            return 0;
        return video.getLikeCount();
    }
    public Video reactLike(Long videoId, String username) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null)
            return null;

        String evaluacion = video.getReaction(username);

        if (evaluacion != null && evaluacion.equals("like")) {
            // 如果之前已经点赞过，再次点击取消点赞
            video.setLikeCount(video.getLikeCount() - 1);
            video.getReaction().remove(username);
        } else if (evaluacion != null && evaluacion.equals("dislike")) {
            // 原来是点踩 -> 变成点赞
            video.setDislikeCount(video.getDislikeCount() - 1);
            video.setLikeCount(video.getLikeCount() + 1);
            video.getReaction().put(username, "like");
        } else {
            // 没有反应 -> 点赞
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
            // 之前点踩 → 点击取消点踩
            video.setDislikeCount(video.getDislikeCount() - 1);
            video.getReaction().remove(username);

        } else if (evaluacion != null && evaluacion.equals("like")) {
            // 之前点赞 → 变成点踩
            video.setLikeCount(video.getLikeCount() - 1);
            video.setDislikeCount(video.getDislikeCount() + 1);
            video.getReaction().put(username, "dislike");

        } else {
            // 之前没有反应 → 点踩
            video.setDislikeCount(video.getDislikeCount() + 1);
            video.getReaction().put(username, "dislike");
        }
        videoRepository.save(video);
        return video;
    }


}



