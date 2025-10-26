package com.tecnocampus.LS2.protube_back;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.repository.videoReposity;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class AppStartupRunner implements ApplicationRunner {
    private static final Logger LOG =
            LoggerFactory.getLogger(AppStartupRunner.class);

    @Autowired
    private VideoService videoService;
    @Autowired
    private videoReposity VideoRepository;  // ⚠️ 你缺少这个注入！



    private final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    public AppStartupRunner(Environment env, VideoService videoService) {
        this.env = env;
        this.videoService = videoService;
    }

    // Example variables from our implementation. 
    // Feel free to adapt them to your needs
    @Autowired
    private final Environment env;

    public AppStartupRunner(Environment env) {
        this.env = env;
        final var rootDir = env.getProperty("pro_tube.store.dir");

    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // 1️⃣ 读取配置路径
        String metaDir = env.getProperty("pro_tube.metadata.dir");
        String storeDir = env.getProperty("pro_tube.store.dir");

        LOG.info("🧩 Metadata dir: {}", metaDir);
        LOG.info("🧩 Store dir: {}", storeDir);

        if (metaDir == null || storeDir == null) {
            LOG.error("❌ Error al iniciar: falta la configuración de la ruta de metadatos de video.(pro_tube.metadata.dir 或 pro_tube.store.dir)。");
            return;
        }

        try {
            // 2️⃣ 构建视频列表
            List<Video> videos = buildVideoList(metaDir, storeDir);

            // 3️⃣ 保存到数据库
            if (!videos.isEmpty()) {
                VideoRepository.saveAll(videos);
                LOG.info("✅ Se cargaron y almacenaron correctamente los metadatos de {} videos.", videos.size());
            } else {
                LOG.warn("⚠️ No se encontró ningún archivo de metadatos de video, por favor verifica el directorio.");
            }

        } catch (Exception e) {
            LOG.error("❌ Error al iniciar: no se pudo leer el directorio de metadatos de video.", e);
        }
    }

    private List<Video> buildVideoList(String metaDir, String storeDir) {
        try {
            // 1️⃣ 扫描目录，过滤出所有 .json 文件
            return Files.list(Paths.get(metaDir))
                    .filter(path -> path.toString().endsWith(".json"))  // 只处理 JSON 文件
                    .map(path -> parseVideo(path.toFile(), storeDir))   // 解析每个文件
                    .filter(Objects::nonNull)                            // 过滤掉解析失败的
                    .collect(Collectors.toList());                       // 收集成列表

        } catch (Exception e) {
            LOG.error("❌ Error al escanear el directorio: {}", metaDir, e);
            return List.of();  // 返回空列表
        }
    }
    private Video parseVideo(File jsonFile, String storeDir) {
        try {
            LOG.info("📄 Processing file: {}",jsonFile.getName());
            // 2️⃣ 使用 Jackson 将 JSON 文件转换为 Video 对象
            Video video = mapper.readValue(jsonFile, Video.class);

            // 3️⃣ 设置视频文件名和完整路径
            String fileName = video.getId() + ".mp4";
            video.setFileName(fileName);
            video.setPath(storeDir + "/" + fileName);

            LOG.debug("✅ Video analizado con éxito: {}", video.getTitle());
            LOG.info("🎬 video.id = {}", video.getId());

            return video;

        } catch (Exception e) {
            LOG.error("❌ Error al analizar el archivo JSON: {}", jsonFile.getName(), e);
            return null;  // 解析失败返回 null，会被 filter 过滤掉
        }
    }


}
