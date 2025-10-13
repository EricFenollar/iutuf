package com.tecnocampus.LS2.protube_back.services;

import com.tecnocampus.LS2.protube_back.persistence.video;
import com.tecnocampus.LS2.protube_back.repository.videoReposity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideoService {

    private final videoReposity videoRepository;

    @Value("${pro_tube.store.dir:C:/videos}")
    private String videoDir;

    public VideoService(videoReposity videoRepository) {
        this.videoRepository = videoRepository;
    }

    public List<String> getVideos() {

        return List.of("video1", "video2");
    }


    public video getVideoById(Long id) {
        //使用findByID从Repository获取视频，如果找不到返回一个404的错误，也就是异常
        //Usar findBYiD para obener el vídeo del reposity,si no se encyentra , devolver un error 404
        video v = videoRepository.findById(Long.valueOf(String.valueOf(id)))
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
        video v=  videoRepository.findById(Long.valueOf(String.valueOf(id))).orElseThrow(()->new RuntimeException("Video not found"));
        if(v.getPath()==null||v.getPath().isEmpty()){
            if(v.getFileName()!=null&&!v.getFileName().isEmpty()){
                return videoDir+"/"+v.getFileName()+".png";
            }else{
                return videoDir+"/"+id+".png";
            }
        }
        return v.getPath().replace(".mp4", ".webp");
        }

    }


