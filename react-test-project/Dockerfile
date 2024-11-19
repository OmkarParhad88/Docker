FROM node:21

WORKDIR /my-react-app-docker

COPY react-test-project/ /my-react-app-docker

RUN npm install 

EXPOSE 5173

CMD [ "npm","run","dev" ]




