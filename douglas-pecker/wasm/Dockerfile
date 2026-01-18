# Базовый образ с nginx
FROM nginx:stable-alpine

# Удаляем дефолтный конфиг (не обязательно, но чище)
RUN rm /etc/nginx/conf.d/default.conf

# Добавляем свой простой конфиг
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение (vite build → dist/)
COPY dist /usr/share/nginx/html

# Nginx слушает 80 порт
EXPOSE 80

# Запуск nginx в foreground
CMD ["nginx", "-g", "daemon off;"]
