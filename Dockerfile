FROM node:22.3.0-alpine3.19 AS build-stage
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
USER root
COPY --chown=node:node package*.json /app/
RUN npm cache clean --force
RUN npm install

# #Agument docker build
ARG ARG_BASE_SCERET_FRONTEND
ARG ARG_DIR_SECRET

# #---------------------------------------
RUN apk update && apk add --no-cache git
RUN git clone "`echo ${ARG_BASE_SCERET_FRONTEND}`"

RUN mv "`echo ${ARG_DIR_SECRET}`" ./
RUN rm -rf env-ut/
# #---------------------------------------

#COPY . .
COPY --chown=node:node .eslintignore /app/
COPY --chown=node:node src/ /app/src
COPY --chown=node:node .eslintrc /app/
COPY --chown=node:node *.ts /app/
COPY --chown=node:node *.js /app/
COPY --chown=node:node *.json /app/

USER root
RUN npm run build

FROM node:22.3.0-alpine3.19 AS production-stage
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

RUN apk add --no-cache \
    supervisor \
    nginx \
    tzdata

COPY --from=build-stage /app/.output /app/.output
COPY nginx.config /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

ENV TZ Asia/Jakarta
RUN date
EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]