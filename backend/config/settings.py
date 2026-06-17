"""
Django settings for the Webrand backend.

Secrets are read from a local .env via python-decouple. See .env.example.
"""
from pathlib import Path

import dj_database_url
from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# --- Core security ----------------------------------------------------------
SECRET_KEY = config("SECRET_KEY", default="dev-insecure-change-me")
# Secure by default: DEBUG must be explicitly turned on. Leaving it on exposes
# full tracebacks, settings, and the URLconf on any error.
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv()
)

# --- Applications -----------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third-party
    "rest_framework",
    "corsheaders",
    "drf_yasg",
    # local
    "apps.catalog",
    "apps.leads",
    "apps.news",
    "apps.showcase",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be above CommonMiddleware
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --- Database ---------------------------------------------------------------
# SQLite locally; set DATABASE_URL (e.g. postgres://...) in prod. An empty
# DATABASE_URL (as in .env.example) counts as unset and falls back to SQLite.
DATABASES = {
    "default": dj_database_url.parse(
        config("DATABASE_URL", default="") or f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# --- Password validation ----------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- I18N / TZ --------------------------------------------------------------
LANGUAGE_CODE = "ru"
TIME_ZONE = "Asia/Dushanbe"
USE_I18N = True
USE_TZ = True

# --- Static & media ---------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Object storage (S3-compatible) for uploaded media. Switches on only when the
# credentials are provided via env; otherwise (local dev) media stays on the
# local filesystem and nothing changes. Two media storages on purpose:
#   default  — public site assets (project logos): plain, cacheable URLs.
#   resumes  — applicant CVs (PII): never given a public URL. Even .url is
#              querystring-signed, and the only sanctioned access path is the
#              streaming endpoint LeadResumeView (signed token, staff-minted).
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID", default="")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY", default="")
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME", default="")
AWS_S3_ENDPOINT_URL = config("AWS_S3_ENDPOINT_URL", default="")
AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME", default="")
# Optional: public domain for the bucket (e.g. an R2 public/custom domain or a
# CDN). Applied to public media only — logo URLs are then served from it.
AWS_S3_CUSTOM_DOMAIN = config("AWS_S3_CUSTOM_DOMAIN", default="")

USE_S3 = bool(AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and AWS_STORAGE_BUCKET_NAME)

if USE_S3:
    _S3_COMMON = {
        "access_key": AWS_ACCESS_KEY_ID,
        "secret_key": AWS_SECRET_ACCESS_KEY,
        "bucket_name": AWS_STORAGE_BUCKET_NAME,
        "endpoint_url": AWS_S3_ENDPOINT_URL or None,
        "region_name": AWS_S3_REGION_NAME or None,
        "location": "media",
        "file_overwrite": False,
        # ACLs off by default: R2/MinIO reject them; on AWS make the bucket
        # policy allow public read for media/* except media/resumes/*.
        "default_acl": None,
    }
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {
                **_S3_COMMON,
                "querystring_auth": False,
                **(
                    {"custom_domain": AWS_S3_CUSTOM_DOMAIN}
                    if AWS_S3_CUSTOM_DOMAIN
                    else {}
                ),
            },
        },
        "resumes": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {**_S3_COMMON, "querystring_auth": True},
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
        },
    }
else:
    STORAGES = {
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        # Local resumes land under MEDIA_ROOT/resumes/, where direct /media/
        # access is blocked by protected_media_serve (config/urls.py).
        "resumes": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
        },
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- CORS -------------------------------------------------------------------
# Only the deployed frontend + local dev. Never CORS_ALLOW_ALL_ORIGINS.
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://webrand-flame.vercel.app,http://localhost:5173,http://localhost:5174,http://localhost:3000",
    cast=Csv(),
)

# --- CSRF -------------------------------------------------------------------
# Required so the Django admin (/admin/) login POST passes Origin checks when
# served over HTTPS (e.g. on Railway). Must include the scheme, e.g.
# https://your-app.up.railway.app — comma-separated for multiple hosts.
CSRF_TRUSTED_ORIGINS = config(
    "CSRF_TRUSTED_ORIGINS",
    default="",
    cast=Csv(),
)

# Railway injects RAILWAY_PUBLIC_DOMAIN at runtime (e.g.
# webrand-production.up.railway.app). Auto-allow it so the deploy healthcheck
# (/api/vacancies/) and the Django admin work without hardcoding the generated
# domain — it isn't known until the first deploy, and DEBUG=False otherwise
# rejects it with a 400 DisallowedHost.
RAILWAY_PUBLIC_DOMAIN = config("RAILWAY_PUBLIC_DOMAIN", default="")
if RAILWAY_PUBLIC_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_PUBLIC_DOMAIN)
    # Railway probes with Host: healthcheck.railway.app — without this the
    # deploy healthcheck gets a 400 DisallowedHost and the deploy fails.
    ALLOWED_HOSTS.append("healthcheck.railway.app")
    CSRF_TRUSTED_ORIGINS.append(f"https://{RAILWAY_PUBLIC_DOMAIN}")

# --- DRF --------------------------------------------------------------------
REST_FRAMEWORK = {
    # JWT for the admin write-API; SessionAuthentication keeps the Django admin
    # and the browsable API working. Anonymous requests (public reads, lead
    # intake) are unauthenticated and allowed by per-view permissions.
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",
        "leads": "5/min",
        # Dedicated cap for the login endpoint (credential brute-force defense).
        "login": "5/min",
    },
}

# --- JWT (djangorestframework-simplejwt) ------------------------------------
from datetime import timedelta  # noqa: E402

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# --- Transport / cookie hardening -------------------------------------------
# Always-safe headers (work over plain HTTP, so on by default).
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# HTTPS-only hardening — enable in prod (behind TLS) via SECURE_SSL=True. Left
# off locally so the http://localhost dev flow and Django admin login still work.
SECURE_SSL = config("SECURE_SSL", default=False, cast=bool)
if SECURE_SSL:
    SECURE_SSL_REDIRECT = True
    # Railway's internal healthcheck probes over plain HTTP without
    # X-Forwarded-Proto, so the SSL redirect would bounce it to an
    # unreachable https URL and fail the deploy. Exempt just that path.
    SECURE_REDIRECT_EXEMPT = [r"^api/vacancies/$"]
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --- Telegram (read in apps/leads/telegram.py) ------------------------------
TELEGRAM_BOT_TOKEN = config("TELEGRAM_BOT_TOKEN", default="")
TELEGRAM_CHAT_ID = config("TELEGRAM_CHAT_ID", default="")
TELEGRAM_APPLICATIONS_CHAT_ID = config("TELEGRAM_APPLICATIONS_CHAT_ID", default="")

# --- Logging (so Telegram failures are visible) -----------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
