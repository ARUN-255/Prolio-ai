const crypto = require("crypto");

const CHATBOT_VISITOR_COOKIE = "prolio_chat_visitor";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const isSafeVisitorId = (value) => {
  return typeof value === "string" && /^[a-zA-Z0-9-]{8,100}$/.test(value);
};

const chatbotVisitor = (req, res, next) => {
  try {
    const headerVisitorId = req.headers["x-prolio-visitor"];
    let visitorId = isSafeVisitorId(headerVisitorId)
      ? headerVisitorId
      : req.cookies?.[CHATBOT_VISITOR_COOKIE];

    if (!isSafeVisitorId(visitorId)) {
      visitorId = crypto.randomUUID();
    }

    // Keep the cookie for same-site production requests while also allowing
    // the public frontend to send the stable visitor id explicitly.
    if (req.cookies?.[CHATBOT_VISITOR_COOKIE] !== visitorId) {
      res.cookie(CHATBOT_VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: THIRTY_DAYS,
      });
    }

    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : req.ip || req.socket?.remoteAddress || "unknown";

    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex");

    req.chatbotVisitor = {
      visitorId,
      ipHash,
    };

    next();
  } catch (error) {
    console.error("CHATBOT VISITOR ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to identify chatbot visitor",
    });
  }
};

module.exports = chatbotVisitor;
