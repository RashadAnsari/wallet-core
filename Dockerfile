FROM node:14-alpine

RUN apk add --update --no-cache \
    bash ca-certificates

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

CMD ["node", "bin/www.js"]
