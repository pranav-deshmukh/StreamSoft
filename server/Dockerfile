# Backend Dockerfile (backend/Dockerfile)

# Step 1: Use Node.js as the base image
FROM node:18-alpine

# Step 2: Install ffmpeg in the container
RUN apk add --no-cache ffmpeg

# Step 3: Set the working directory inside the container
WORKDIR /app

# Step 4: Copy package.json and package-lock.json for installing dependencies
COPY package.json package-lock.json ./

# Step 5: Install dependencies
RUN npm install

# Step 6: Copy the rest of the application code
COPY . .

# Step 7: Expose the port the backend server runs on
EXPOSE 8000

# Step 8: Run the backend server
CMD ["node", "index.js"]
