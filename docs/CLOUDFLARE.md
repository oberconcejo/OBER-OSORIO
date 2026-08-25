# Guía de Producción y Cloudflare - Electoral360

Este documento contiene los parámetros exactos requeridos para el paso a Producción (Go-Live) de la plataforma Electoral360. 

## 1. Topología de Red y DNS (Cloudflare)
- **Frontend**: Alojado preferiblemente en Cloudflare Pages o AWS S3 + CloudFront. El registro CNAME debe estar Proxied (Nube Naranja) a través de Cloudflare.
- **Backend API**: Alojado en un clúster (ej. AWS ECS, GCP Cloud Run o VPS dedicado). El registro A debe apuntar a la IP del balanceador de carga y estar Proxied (Nube Naranja).

## 2. Reglas de WAF y Rate Limiting
- **Rate Limit de Login**: Restringir `POST /api/v1/auth/login` a máximo 5 intentos por minuto por IP.
- **Rate Limit de API General**: 100 requests / minuto.
- **Regla WAF Personalizada**: Bloquear peticiones que contengan sentencias `UNION SELECT` o `EXEC` en la query string o body.

## 3. Caché
- **Caché Estático**: Configurar Cloudflare Page Rules para cachear `*.js`, `*.css`, `*.png` con expiración de 1 año (Cache Level: Cache Everything).
- **Caché de API**: Excluir explícitamente `/api/*` del caché de Cloudflare (Bypass Cache) para evitar la filtración de datos electorales o tokens de sesión cruzados (Regla 45).

## 4. Variables de Entorno de Producción
Las siguientes variables deben estar inyectadas en el entorno (nunca en el repositorio):
- `DATABASE_URL`: URI de conexión con SSL requerido (`sslmode=require`).
- `JWT_SECRET`: Cadena criptográfica de 256 bits generada aleatoriamente.
- `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY`: Credenciales con permiso estricto de escritura y generación de pre-signed URLs (sin lectura pública).
