import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1,
    });

    // request denied
    if (decision.isDenied()) {
      // rate limit
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
        });
      }

      // bot detected
      else if (decision.reason.isBot()) {
        return res.status(403).json({
          error: "Bot access denied",
          message: "Automated requests are not allowed.",
        });
      }

      // other security issues
      else {
        return res.status(403).json({
          error: "Forbidden",
          message: "Access denied by security policy.",
        });
      }
    }

    // spoofed bot detection
    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed(),
      )
    ) {
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bot activity detected.",
      });
    }

    // continue request
    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);

    // fail open
    next();
  }
};
