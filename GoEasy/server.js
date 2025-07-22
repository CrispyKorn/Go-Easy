// Import required dependencies. {} import specific methods.
import express from "express";
import { createServer } from "node:http"
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, "public")));

let p1Id = 0;
let p2Id = 0;

let p1WantsWin = null;
let p2WantsWin = null;
let p1Won = null;
let p1ThinksP2Win = null;
let p2ThinksP1Win = null;

let p1Score = 0;
let p2Score = 0;

io.on("connection", (socket) => 
{
    console.log("A user connected: ", socket.id);
    if (p1Id === 0) p1Id = socket.id;
    else if (p2Id === 0) 
    {
        p2Id = socket.id;
        
        socket.emit("hide-hostonly-content");
    }
    else 
    {
        console.log(`${socket.id} was disconnected due to a full lobby.`);
        socket.disconnect(true);
    }

    console.log(`p1Id: ${p1Id}, p2Id: ${p2Id}`);

    socket.on("disconnect", () => 
    {
        console.log("User disconnected: ", socket.id);

        if (socket.id === p1Id) p1Id = 0;
        else if (socket.id === p2Id) p2Id = 0;

        console.log(`p1Id: ${p1Id}, p2Id: ${p2Id}`);
    });

    // Interaction events

    socket.on("pre-choice-win", () => 
    {
        if (socket.id === p1Id) p1WantsWin = true;
        else p2WantsWin = true;

        console.log(`P1 wants win: ${p1WantsWin} | P2 wants win: ${p2WantsWin}`);
    });

    socket.on("pre-choice-lose", () => 
    {
        if (socket.id === p1Id) p1WantsWin = false;
        else p2WantsWin = false;

        console.log(`P1 wants win: ${p1WantsWin} | P2 wants win: ${p2WantsWin}`);
    });

    socket.on("post-result-win", () => 
    {
        p1Won = true;

        console.log(`P1 won: ${p1Won}`);
    });

    socket.on("post-result-lose", () => 
    {
        p1Won = false;

        console.log(`P1 won: ${p1Won}`);
    });

    socket.on("post-choice-win", () => 
    {
        if (socket.id === p1Id) p1ThinksP2Win = true;
        else p2ThinksP1Win = true;

        console.log(`P1 thinks P2 wanted to win: ${p1ThinksP2Win} | P2 thinks P1 wanted to win: ${p2ThinksP1Win}`);
    });

    socket.on("post-choice-lose", () => 
    {
        if (socket.id === p1Id) p1ThinksP2Win = false;
        else p2ThinksP1Win = false;

        console.log(`P1 thinks P2 wanted to win: ${p1ThinksP2Win} | P2 thinks P1 wanted to win: ${p2ThinksP1Win}`);
    });

    socket.on("reveal", () => 
    {
        io.emit("reveal-results", p1WantsWin ? "Win" : "Lose", p2WantsWin ? "Win" : "Lose");

        console.log("Revealing...");
    });

    socket.on("next-round", () => 
    {
        p1WantsWin = null;
        p2WantsWin = null;
        p1Won = null;
        p1ThinksP2Win = null;
        p2ThinksP1Win = null;

        console.log("Moving to next round...");
    });

    socket.on("reset", () => 
    {
        p1WantsWin = null;
        p2WantsWin = null;
        p1Won = null;
        p1ThinksP2Win = null;
        p2ThinksP1Win = null;
        p1Score = 0;
        p2Score = 0;

        console.log("Resetting game...");
    });
});

server.listen(3000, () => 
{
    console.log("Server running at http://localhost:3000");
});