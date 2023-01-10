FROM node:lts as base

WORKDIR /app
COPY package*.json /
# COPY yarn.lock /
EXPOSE 3010


# FROM base as prod
# RUN yarn 
# ENV NODE_ENV=production
# # RUN npm ci
# COPY . /
# CMD ["yarn", "prod"]

FROM base as dev
# RUN yarn 
ENV NODE_ENV=development
RUN yarn
COPY . /
CMD ["yarn", "dev"]