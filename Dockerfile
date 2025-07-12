# This Dockerfile is deprecated
# Use the individual service Dockerfiles instead:
# - lumus/Dockerfile for the backend API
# - umbra/Dockerfile for the frontend
# 
# To run both services, use:
# docker compose up

FROM alpine:latest
RUN echo "Use 'docker compose up' to run the application" > /tmp/readme.txt
CMD ["cat", "/tmp/readme.txt"]
