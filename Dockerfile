FROM node:22-alpine

RUN addgroup -S apiGroup \
  && adduser -S -G apiGroup apiUser
RUN mkdir -p /home/apiUser/.npm-global
USER apiUser
WORKDIR /home/apiUser/app
COPY --chown=apiUser:apiGroup . .
COPY --chown=apiUser:node package*.json ./
RUN npm config set prefix /home/apiUser/.npm-global

RUN rm -rf node_modules
RUN npm install

EXPOSE 5000
CMD ["npx", "nodemon"]
