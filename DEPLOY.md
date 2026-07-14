# Docker Hub 및 AWS EC2 배포

## 1. 로컬 환경변수 준비

`.env.example`을 복사해 `.env`를 만들고 실제 값으로 수정합니다.

```powershell
Copy-Item .env.example .env
```

긴 Django 비밀키는 다음 명령으로 만들 수 있습니다.

```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

필수 설정:

- `DOCKERHUB_USERNAME`: Docker Hub 사용자명
- `DJANGO_SECRET_KEY`: 위 명령으로 생성한 비밀키
- `DJANGO_ALLOWED_HOSTS`: EC2 퍼블릭 IP 또는 도메인
- `DJANGO_CSRF_TRUSTED_ORIGINS`: `http://EC2_IP:8000` 또는 HTTPS 도메인

`.env`는 Git과 Docker 이미지에서 제외되며 절대 커밋하지 않습니다.

## 2. 이미지 빌드 및 Docker Hub 푸시

```powershell
docker login
docker compose build
docker compose push
```

## 3. EC2 보안 그룹

인바운드 규칙에 다음 포트를 허용합니다.

- SSH: TCP 22, 접속할 관리자 IP만 허용
- 서비스: TCP 8000, 시연용이면 `0.0.0.0/0`

운영 도메인과 HTTPS를 연결할 경우 8000번을 외부에 직접 공개하는 대신 리버스 프록시 또는 로드 밸런서를 통해 80/443을 사용합니다.

## 4. EC2에서 실행

EC2에 `docker-compose.yml`과 `.env`를 준비한 다음 실행합니다.

```bash
docker login
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f web
```

접속 주소:

```text
http://EC2_PUBLIC_IP:8000
```

## 5. 새 이미지 재배포

로컬에서 새 이미지를 푸시합니다.

```powershell
docker compose build
docker compose push
```

EC2에서 새 이미지를 반영합니다.

```bash
docker compose pull
docker compose up -d
```

`kiosk_data` 볼륨을 사용하므로 컨테이너를 교체해도 SQLite 데이터는 유지됩니다.
