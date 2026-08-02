"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/uploadRoutes.ts
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Add a test route to verify the router is working
router.get("/test", (req, res) => {
    res.json({ message: "Upload route is working!" });
});
// Upload image (admin/editor only)
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("image"), uploadController_1.uploadImage);
// Delete image (admin/editor only)
router.delete("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), uploadController_1.deleteImage);
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map