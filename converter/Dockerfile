# This image must be built from the root project directory context

FROM node:22-bookworm-slim AS builder

ARG VERSION

COPY . /workspace
WORKDIR /workspace

RUN npm ci && \
    npm run converter:ci && \
    npm run converter:compile && \
    npm run converter:prune

FROM gcr.io/distroless/nodejs22-debian12

COPY --from=builder /workspace/converter/docs/openapi.yml /app/docs/openapi.yml
COPY --from=builder /workspace/converter/build /app/build
COPY --from=builder /workspace/converter/package.json /app/package.json
COPY --from=builder /workspace/converter/node_modules /app/node_modules

WORKDIR /app
EXPOSE 3000

CMD ["build/main.js"]
