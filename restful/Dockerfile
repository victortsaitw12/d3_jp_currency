FROM node:carbon
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN npm install
RUN npm install -g nodemon
RUN npm install -g express
RUN npm install -g mongodb 
CMD ["nodemon", "index.js"]
