import arcjet, {tokenBucket, shield, detectBot} from "@arcjet/node";

import "dotenv/config";

// init arcjet
export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    // shield protects from common attacks e.g. SQL injection, XSS, CSRF attacks
    shield({mode: "LIVE"}),
    
    detectBot({
      mode: "LIVE",
      // allow search engines
      allow: [
        "CATEGORY:SEARCH_ENGINE"
      ]
    }),
    
    // implement token bucket for handling requests
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    })
  ]
})
