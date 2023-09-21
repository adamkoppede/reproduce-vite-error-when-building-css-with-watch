FROM node:18.18-alpine3.18

# mutate gid of node user to match host's uid (given via build arg)
ARG NODE_UID=1000
ARG NODE_GID=1000
RUN printf 'node:x:%s:node' "${NODE_GID}" > /etc/group && \
    printf 'node:x:%s:%s:Linux User,,,:/home/node:/sbin/nologin' "${NODE_UID}" "${NODE_GID}" > /etc/passwd

# refresh the owner due to possible uid / gid change
RUN mkdir -pv /home/node \
    && chown -R node:node /home/node \
    && mkdir -pv ~/.local/share/pnpm \
    && corepack enable \
    && corepack prepare pnpm@latest --activate

ENV PNPM_HOME="~/.local/share/pnpm"
ENV PATH="${PATH}:~/.local/share/pnpm"

USER "$NODE_UID":"$NODE_GID"

