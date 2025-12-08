package com.tecnocampus.LS2.protube_back;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tecnocampus.LS2.protube_back.persistence.Video;
import com.tecnocampus.LS2.protube_back.repository.VideoRepository;
import com.tecnocampus.LS2.protube_back.services.VideoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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
    private VideoRepository videoRepository;



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
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Boolean deletePreviousData = env.getProperty("pro_tube.delete_previous_data", Boolean.class);
        if (deletePreviousData) {
            String storageDir = env.getProperty("pro_tube.store.dir");
            Path baseDir = Paths.get(storageDir);

            try {
                if (Files.exists(baseDir)) {
                    try (var stream = Files.walk(baseDir)) {
                        stream.sorted((a, b) -> b.compareTo(a)) // hijos primero
                                .forEach(path -> {
                                    if (!path.equals(baseDir)) {
                                        try {
                                            Files.delete(path);
                                        } catch (IOException e) {
                                            e.printStackTrace();
                                        }
                                    }
                                });
                    }
                }
                Path files = baseDir.resolve("files");
                Path thumbnails = baseDir.resolve("thumbnails");

                Files.createDirectories(files);
                Files.createDirectories(thumbnails);

            } catch (IOException e) {
                e.printStackTrace();
            }
        }


        Boolean loadInitialData = env.getProperty("pro_tube.load_initial_data", Boolean.class);
        if (loadInitialData == null || !loadInitialData) {
            LOG.info("⏭ Importación inicial desactivada.");
            return;
        }

        String initialVideosDir = env.getProperty("pro_tube.initial_videos.dir");

        LOG.info("🧩 Metadata dir: {}", initialVideosDir);

        if (initialVideosDir == null) {
            LOG.error("❌ Error al iniciar: falta la configuración de la ruta de metadatos de video.(pro_tube.metadata.dir 或 pro_tube.store.dir)。");
            return;
        }

        try {
            List<Video> videos = buildVideoList(initialVideosDir);

            if (!videos.isEmpty()) {
                videoRepository.saveAll(videos);
                LOG.info("✅ Se cargaron y almacenaron correctamente los metadatos de {} videos.", videos.size());
            } else {
                LOG.warn("⚠️ No se encontró ningún archivo de metadatos de video, por favor verifica el directorio.");
            }

        } catch (Exception e) {
            LOG.error("❌ Error al iniciar: no se pudo leer el directorio de metadatos de video.", e);
        }
    }

    private List<Video> buildVideoList(String initialVideosDir) {
        try {
            return Files.list(Paths.get(initialVideosDir))
                    .filter(path -> path.toString().endsWith(".json"))
                    .map(path -> parseVideo(path.toFile(), initialVideosDir))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            LOG.error("❌ Error al escanear el directorio: {}", initialVideosDir, e);
            return List.of();
        }
    }
    private Video parseVideo(File jsonFile, String initialVideosDir) {
        try {
            LOG.info("📄 Processing file: {}",jsonFile.getName());
            Video video = mapper.readValue(jsonFile, Video.class);

            video.setFilePath(initialVideosDir + "/" + video.getId() + ".mp4");
            video.setThumbnailPath(initialVideosDir + "/" + video.getId() + ".webp");

            LOG.debug("✅ Video analizado con éxito: {}", video.getTitle());
            LOG.info("🎬 video.id = {}", video.getId());

            return video;

        } catch (Exception e) {
            LOG.error("❌ Error al analizar el archivo JSON: {}", jsonFile.getName(), e);
            return null;
        }
    }
}
