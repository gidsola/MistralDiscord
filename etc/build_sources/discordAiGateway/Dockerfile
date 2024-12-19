FROM node:23
WORKDIR /
# make core directory
RUN mkdir /core
# Copy core files
COPY . /core
# Install dependencies
WORKDIR /core
RUN npm install