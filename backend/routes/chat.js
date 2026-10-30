const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const requireUser = require("../middleware/requireUser");

// 챗봇 AI 중계 (로그인 필요)
router.post("/reply", requireUser, chatController.reply);

router.post("/messages", chatController.createMessage);
router.get("/messages", chatController.getMessages);
router.delete("/messages/:chat_id", chatController.deleteMessage);

router.post("/summary", chatController.createSummary);
router.get("/summary", chatController.getSummaries);

module.exports = router;
