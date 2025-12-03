"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const auth_1 = require("./auth");
const websocket_1 = require("./websocket"); //websocket
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// === rooms ===
// GET /rooms
router.get("/", auth_1.authMiddleware, async (req, res) => {
    const userId = req.userId;
    try {
        const rooms = await prisma.room.findMany({
            where: {
                members: {
                    some: { userId } //only rooms that have this user
                }
            },
            include: {
                members: {
                    include: { user: true }
                }
            }
        });
        res.json(rooms);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch rooms" });
    }
});
// GET /rooms/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params; //get the :id from the url
    if (!(0, uuid_1.validate)(id))
        return res.status(400).json({ error: "invalid uuid" });
    try {
        //check if uuid exists in rooms
        const room = await prisma.room.findUnique({
            where: { id },
        });
        if (!room)
            return res.status(404).json({ error: "room not found" });
        res.json(room);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch room" });
    }
});
// curl -X PUT http://127.0.0.1:1300/rooms -H "Content-Type: routerlication/json" -d '{"roomName":"general"}'
// PUT /rooms  (expects { roomName })
router.put("/", async (req, res) => {
    //create room
    try {
        const { roomName, roomImage } = req.body;
        if (!roomName)
            return res.status(400).json({ error: "roomName is required" });
        const room = await prisma.room.create({
            data: {
                id: (0, uuid_1.v4)(),
                roomName,
                roomImage,
            },
        });
        res.json(room);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to create room" });
    }
});
// GET /rooms/:id/users
router.get("/:id/users", async (req, res) => {
    // list users of a room
    const { id } = req.params; //get the :id from the url
    if (!(0, uuid_1.validate)(id))
        return res.status(400).json({ error: "invalid uuid" });
    try {
        //check if uuid exists in rooms
        const room = await prisma.room.findUnique({
            where: { id },
        });
        if (!room)
            return res.status(404).json({ error: "room not found" });
        const users = await prisma.roomMember.findMany({ where: { roomId: id } });
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "database error" });
    }
});
// POST /rooms/:id/join
router.post("/:id/join", auth_1.authMiddleware, async (req, res) => {
    // join a room
    const userId = req.userId;
    const { id } = req.params; //get the :id from the url
    if (!(0, uuid_1.validate)(id))
        return res.status(400).json({ error: "invalid uuid" });
    try {
        //check if uuid exists in rooms
        const room = await prisma.room.findUnique({
            where: { id },
        });
        if (!room)
            return res.status(404).json({ error: "room not found" });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "user not found" });
        // check if already a member
        const existing = await prisma.roomMember.findFirst({
            where: { roomId: id, userId },
        });
        if (existing)
            return res.status(400).json({ error: "already a member" });
        // add to room
        const member = await prisma.roomMember.create({
            data: { roomId: id, userId },
        });
        res.json(member);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "database error" });
    }
});
// POST /rooms/:id/leave
router.post("/:id/leave", auth_1.authMiddleware, async (req, res) => {
    // leave a room
    const userId = req.userId;
    const { id } = req.params; //get the :id from the url
    if (!(0, uuid_1.validate)(id))
        return res.status(400).json({ error: "invalid uuid" });
    try {
        //check if uuid exists in rooms
        const room = await prisma.room.findUnique({
            where: { id },
        });
        if (!room)
            return res.status(404).json({ error: "room not found" });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "user not found" });
        // check if already a member
        const existing = await prisma.roomMember.findFirst({
            where: { roomId: id, userId },
        });
        if (!existing)
            return res.status(400).json({ error: "not a member of this room" });
        // remove from room
        const member = await prisma.roomMember.delete({
            where: {
                roomId_userId: {
                    roomId: id,
                    userId: userId
                }
            }
        });
        res.json(member);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "database error" });
    }
});
// GET /rooms/:id/messages
router.get("/:id/messages", auth_1.authMiddleware, async (req, res) => {
    // get messages from a room
    const userId = req.userId; //user
    const { id } = req.params; //get the :id from the url
    if (!(0, uuid_1.validate)(id))
        return res.status(400).json({ error: "invalid uuid" });
    try {
        //check if uuid exists in rooms
        const room = await prisma.room.findUnique({
            where: { id },
        });
        if (!room)
            return res.status(404).json({ error: "room not found" });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: "user not found" });
        // check if already a member
        const existing = await prisma.roomMember.findFirst({
            where: { roomId: id, userId },
        });
        if (!existing)
            return res.status(400).json({ error: "not a member of this room" });
        const messages = await prisma.message.findMany({ where: { roomId: id }, include: { owner: true } });
        res.json(messages);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch room" });
    }
});
// ! to find a message
// const num = Number(value);
// if (Number.isInteger(num)) {
//   console.log("valid integer id");
// }
// ! websocketless
// below sends messages
// POST /rooms/:id/messages  (expects { text })
// router.post("/:id/messages", authMiddleware, async (req, res) => {
//   // post a message
//   const user = (req as any).userId; //user
//   const { id } = req.params; //get the :id from the url
//   if (!isUuid(id)) return res.status(400).json({ error: "invalid uuid" });
//   const { text, room } = req.body;
//   if (!text) return res.status(400).json({ error: "text is required" });
//   if (!user) return res.status(404).json({ error: "user not found" });
//     // check if already a member
//     const existing = await prisma.roomMember.findFirst({
//       where: { roomId: id, userId: user },
//     });
//     if (!existing) return res.status(400).json({ error: "not a member of this room" });
//   try {
//     const message = await prisma.message.create({
//       data: {
//         text: text,
//         ownerId: user,
//         roomId: room,
//       },
//     });
//     res.json(message);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "failed to create message" });
//   }
// });
router.post("/:id/messages", auth_1.authMiddleware, async (req, res) => {
    const user = req.userId;
    const { id } = req.params;
    const { text, room } = req.body;
    if (!(0, uuid_1.validate)(id))
        return res.status(400).json({ error: "invalid uuid" });
    if (!text)
        return res.status(400).json({ error: "text is required" });
    if (!user)
        return res.status(404).json({ error: "user not found" });
    const existing = await prisma.roomMember.findFirst({
        where: { roomId: id, userId: user },
    });
    if (!existing)
        return res.status(400).json({ error: "not a member of this room" });
    try {
        const message = await prisma.message.create({
            data: {
                text: text,
                ownerId: user,
                roomId: room,
            },
            include: { owner: true }
        });
        // broadcast to all websocket clients in the same room
        const payload = JSON.stringify({ type: 'message', roomId: room, message });
        websocket_1.wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(payload);
            }
        });
        res.json(message);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to create message" });
    }
});
router.post("/join/:roomId", auth_1.authMiddleware, async (req, res) => {
    const userId = req.userId;
    const { roomId } = req.params;
    try {
        // check if already joined
        const existing = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: { roomId, userId }
            }
        });
        if (existing)
            return res.status(400).json({ error: "already a member" });
        const membership = await prisma.roomMember.create({
            data: { roomId, userId },
            include: { user: true, room: true }
        });
        res.json(membership);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to join room" });
    }
});
exports.default = router;
