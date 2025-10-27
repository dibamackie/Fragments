## Lab 5 – Dockerizing the Fragments Microservice
In this lab, I created a Dockerfile to containerize my Node.js Fragments microservice.
I built and tested the image locally using Docker Desktop and the VS Code Docker extension, verifying that it runs on port 8080 and responds to requests.
Then I copied the project to an AWS EC2 instance, installed Docker, rebuilt the image, and ran it in detached mode.
Using curl from my local machine, I confirmed that the container is reachable via port 8080 and serves the expected 401 Unauthorized response under HTTP Basic Auth.
All required screenshots are included below showing the container running both locally and on EC2, with logs confirming successful startup and request handling.
