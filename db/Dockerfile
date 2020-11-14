FROM mongo:4.4.0 as DB
LABEL maintainer=mobeetravel

FROM DB as DEV

FROM db AS BUILD
ENV MONGO_INITDB_ROOT_USERNAME root
ENV MONGO_INITDB_ROOT_PASSWORD admin
ENV MONGO_INITDB_DATABASE admin
ADD mongo-init.js /docker-entrypoint-initdb.d/

CMD ["mongod", "--auth"]