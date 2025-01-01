# Workout API

This is Nick's Passion project to combine backend APIs with working out!

## Project Setup and Dependencies

This API is designed to operate on Mongo/Mongoose, Express and Docker.

### Helpful Commands

- docker compose up --build | tee logs.txt
- npx nodemon --watch server/\*_/_.ts --ext ts --ignore dist/\* --exec "tsc && node dist/server.js"
- tree -L 2 -I node_modules
