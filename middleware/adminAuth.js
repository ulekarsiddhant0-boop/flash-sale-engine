const crypto = require("node:crypto");

function requireAdminToken(req, res, next) {
  const configuredToken = process.env.ADMIN_TOKEN;
  const authorization = req.get("authorization");
  const match = typeof authorization === "string"
    ? authorization.match(/^Bearer ([^\s]+)$/i)
    : null;

  if (!configuredToken || !configuredToken.trim() || !match) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const expected = Buffer.from(configuredToken, "utf8");
  const supplied = Buffer.from(match[1], "utf8");

  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  return next();
}

module.exports = requireAdminToken;
