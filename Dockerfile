FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# COPY src/secrets/privkey.pem dist/secrets/privkey.pem
# COPY src/secrets/fetchain.pem dist/secrets/fetchain.pem

# EXPOSE 9600

CMD [ "node", "dist/main.js" ]