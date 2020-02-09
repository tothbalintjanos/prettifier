import * as probot from "probot"
import Rollbar from "rollbar"
import { onPullRequest } from "./on-pull-request"
import { onPush } from "./on-push"

if (process.env.ROLLBAR_ACCESS_TOKEN) {
  new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true
  })
}

function startBot(app: probot.Application) {
  app.on("push", onPush)
  app.on("pull_request.opened", onPullRequest)
  console.log("PRETTIFIER STARTED")
}

export = startBot
