FROM node:25-alpine AS builder

RUN apk add --no-cache zip

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build
RUN zip -r bashhero_scormpackage.zip imsmanifest.xml out

FROM scratch AS export-stage
COPY --from=builder /app/bashhero_scormpackage.zip /