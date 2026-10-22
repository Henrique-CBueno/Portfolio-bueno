package com.henriquebueno.api.capas;

import java.io.ByteArrayInputStream;
import java.util.Optional;

import org.jboss.logging.Logger;

import com.henriquebueno.api.PortfolioConfig;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.errors.ErrorResponseException;
import io.quarkus.runtime.Startup;
import jakarta.enterprise.context.ApplicationScoped;

/** Capas no MinIO, num bucket privado: quem serve as imagens é a própria API (GET /capas/<id>). */
@ApplicationScoped
@Startup
public class CapasMinio implements Capas {

	private static final Logger log = Logger.getLogger(CapasMinio.class);

	private final MinioClient minio;
	private final String bucket;

	CapasMinio(PortfolioConfig config) {
		this.minio = MinioClient.builder().endpoint(config.minio().url()).credentials(config.minio().usuario(), config.minio().senha()).build();
		this.bucket = config.minio().bucket();
		criarBucketSePreciso();
	}

	private void criarBucketSePreciso() {
		try {
			if (!minio.bucketExists(BucketExistsArgs.builder().bucket(bucket).build())) {
				minio.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
				log.infof("Bucket %s criado no MinIO", bucket);
			}
		} catch (Exception e) {
			// o MinIO pode subir depois da API; o upload tenta de novo
			log.warnf("MinIO indisponível agora (%s); tento de novo no primeiro upload", e.getMessage());
		}
	}

	@Override
	public void guardar(String id, byte[] imagem, String tipo) {
		criarBucketSePreciso();
		try {
			minio.putObject(PutObjectArgs.builder().bucket(bucket).object(id).contentType(tipo)
					.stream(new ByteArrayInputStream(imagem), imagem.length, -1).build());
		} catch (Exception e) {
			throw new IllegalStateException("não consegui guardar a capa no MinIO: " + e.getMessage(), e);
		}
	}

	@Override
	public Optional<Arquivo> abrir(String id) {
		try {
			var info = minio.statObject(StatObjectArgs.builder().bucket(bucket).object(id).build());
			var conteudo = minio.getObject(GetObjectArgs.builder().bucket(bucket).object(id).build());
			return Optional.of(new Arquivo(conteudo, info.contentType(), info.size()));
		} catch (ErrorResponseException e) {
			if ("NoSuchKey".equals(e.errorResponse().code()) || "NoSuchBucket".equals(e.errorResponse().code())) return Optional.empty();
			throw new IllegalStateException(e);
		} catch (Exception e) {
			throw new IllegalStateException("não consegui ler a capa do MinIO: " + e.getMessage(), e);
		}
	}

	@Override
	public void apagar(String id) {
		try {
			minio.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(id).build());
		} catch (Exception e) {
			log.warnf("Capa %s não foi apagada do MinIO: %s", id, e.getMessage());
		}
	}
}
