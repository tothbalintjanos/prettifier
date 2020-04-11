---
title: Self Hosting
weight: 10
---

This page describes how to run Prettifier yourself. You can skip this part if
you use the [GitHub Application]({{%relref "/install/github-application" %}})

1. create a new GitHub application
   ([detailed instructions](https://developer.github.com/apps/building-github-apps/creating-a-github-app))

2. build the code base:

   ```bash
   cd bot
   make build
   ```

3. set up a server with [NodeJS](https://nodejs.org) version 12 or higher

4. set these environment variables on your server:

   - `APP_ID` - the ID of your GitHub app
   - `PRIVATE_KEY` - the private key of your GitHub app
   - `WEBHOOK_SECRET` - the webhook secret set on GitHub

5. deploy the `/bot/dist` directory to this server and run `make start` on the
   server

6. set up auto-restarting, auto-scaling, logging, monitoring, etc
