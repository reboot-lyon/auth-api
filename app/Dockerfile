FROM node:alpine as APP
LABEL maintainer=reboot

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

FROM APP as DEV
ENV NODE_ENV=development

CMD ["npm", "run", "dev"]

FROM APP as BUILD
CMD ["npm", "run", "build"]
