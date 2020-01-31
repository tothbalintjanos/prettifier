---
id: hosting
title: Hosting
---

This bot runs at https://github.com/apps/prettifier. You can use it for free.
Here is how you can run this bot yourself:

- create a new GitHub application
  ([detailed instructions](https://developer.github.com/apps/building-github-apps/creating-a-github-app))
- deploy the code base in the [bot](../../bot/) directory somewhere and set
  these environment variables on your server:
  - **APP_ID:** the ID of your GitHub app
  - **PRIVATE_KEY:** the private key of your GitHub app
  - **ROLLBAR_ACCESS_TOKEN:** access token for sending crash logs for
    https://rollbar.com (optional)
  - **ROLLBAR_ENDPOINT:** the rollbar API to use, e.g.
    `https://api.rollbar.com/api/1/item` (optional)
  - **WEBHOOK_SECRET:** the webhook secret set on GitHub
