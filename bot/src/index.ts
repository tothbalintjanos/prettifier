import * as probot from "probot"
import { onPullRequest } from "./on-pull-request"
import { onPush } from "./on-push"

function startBot(app: probot.Application) {
  app.on("push", onPush)
  app.on("pull_request.opened", onPullRequest)
  console.log("PRETTIFIER STARTED")
}

export = startBot
