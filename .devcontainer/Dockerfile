FROM node:22-bookworm-slim

RUN apt update && apt upgrade -y && apt install -y \
    curl \
    git \
    locales

RUN echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && locale-gen

WORKDIR /trademax

CMD ["sh", "-c", "eval ${COMMAND}"]
