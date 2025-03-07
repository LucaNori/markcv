FROM python:3.11-alpine

ARG PUID=1000
ARG PGID=1000
ENV PUID=${PUID} PGID=${PGID}

RUN addgroup -g ${PGID} markcv && \
    adduser -D -u ${PUID} -G markcv markcv

RUN apk add --no-cache \
    pandoc \
    fontconfig \
    ttf-dejavu \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --chown=markcv:markcv requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=markcv:markcv . .

USER markcv

EXPOSE 9876

COPY --chown=markcv:markcv entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]