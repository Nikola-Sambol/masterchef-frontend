# 1. Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Serve stage
FROM nginx:stable-alpine

# Kopiramo build u Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiramo custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
