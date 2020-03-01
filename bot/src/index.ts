import * as probot from "probot"
import { onPullRequest } from "./on-pull-request"
import { onPush } from "./on-push"

export = function startBot(app: probot.Application): void {
  app.on("push", onPush)
  app.on("pull_request.opened", onPullRequest)
  console.log("PRETTIFIER STARTED")
}
