FROM node:25-alpine AS builder

RUN apk add --no-cache zip python3

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN ./build_scorm.sh

FROM scratch AS export-stage
COPY --from=builder /app/bashhero_scormpackage.zip /