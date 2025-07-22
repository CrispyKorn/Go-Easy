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
let p1ThinksP2WantsWin = null;
let p2ThinksP1WantsWin = null;

let p1Score = 0;
let p2Score = 0;

io.on("connection", (socket) => 
{
    console.log("A user connected: ", socket.id);

    io.emit("hide-choices");

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
        let isP1 = socket.id === p1Id;
        if (isP1) p1WantsWin = true;
        else p2WantsWin = true;

        socket.emit("client-choice", isP1 ? (p1WantsWin ? "win" : "lose") : (p2WantsWin ? "win" : "lose"));

        console.log(`P1 wants win: ${p1WantsWin} | P2 wants win: ${p2WantsWin}`);
    });

    socket.on("pre-choice-lose", () => 
    {
        let isP1 = socket.id === p1Id;
        if (isP1) p1WantsWin = false;
        else p2WantsWin = false;

        socket.emit("client-choice", isP1 ? (p1WantsWin ? "win" : "lose") : (p2WantsWin ? "win" : "lose"));

        console.log(`P1 wants win: ${p1WantsWin} | P2 wants win: ${p2WantsWin}`);
    });

    socket.on("post-result-win", () => 
    {
        p1Won = true;

        let isP1 = socket.id === p1Id;
        socket.emit("client-result", isP1 ? (p1Won ? "won" : "lost") : (p1Won ? "lost" : "won"));

        console.log(`P1 won: ${p1Won}`);
    });

    socket.on("post-result-lose", () => 
    {
        p1Won = false;

        let isP1 = socket.id === p1Id;
        socket.emit("client-result", p1Won ? "won" : "lost");
        socket.broadcast.emit("client-result", p1Won ? "lost" : "won");

        console.log(`P1 won: ${p1Won}`);
    });

    socket.on("post-choice-win", () => 
    {
        let isP1 = socket.id === p1Id;
        if (isP1) p1ThinksP2WantsWin = true;
        else p2ThinksP1WantsWin = true;

        socket.emit("client-guess", isP1 ? (p1ThinksP2WantsWin ? "win" : "lose") : (p2ThinksP1WantsWin ? "win" : "lose"));

        console.log(`P1 thinks P2 wanted to win: ${p1ThinksP2WantsWin} | P2 thinks P1 wanted to win: ${p2ThinksP1WantsWin}`);
    });

    socket.on("post-choice-lose", () => 
    {
        let isP1 = socket.id === p1Id;
        if (isP1) p1ThinksP2WantsWin = false;
        else p2ThinksP1WantsWin = false;

        socket.emit("client-guess", isP1 ? (p1ThinksP2WantsWin ? "win" : "lose") : (p2ThinksP1WantsWin ? "win" : "lose"));

        console.log(`P1 thinks P2 wanted to win: ${p1ThinksP2WantsWin} | P2 thinks P1 wanted to win: ${p2ThinksP1WantsWin}`);
    });

    socket.on("reveal", () => 
    {
        let p1Points = 0;
        let p2Points = 0;

        if (p1WantsWin === p1Won) p1Points++;
        if (p1ThinksP2WantsWin === p2WantsWin) p1Points++;

        if (p2WantsWin === !p1Won) p2Points++;
        if (p2ThinksP1WantsWin === p1WantsWin) p2Points++;

        p1Score += p1Points;
        p2Score += p2Points;

        io.emit("reveal-results", p1WantsWin ? "Win" : "Lose", p2WantsWin ? "Win" : "Lose");
        io.emit("update-score", p1Score, p2Score);

        console.log("Revealing...");
        console.log(`P1 Points: ${p1Points} | P2 Points: ${p2Points}`);
    });

    socket.on("next-round", () => 
    {
        p1WantsWin = null;
        p2WantsWin = null;
        p1Won = null;
        p1ThinksP2WantsWin = null;
        p2ThinksP1WantsWin = null;

        io.emit("hide-choices");

        console.log("Moving to next round...");
    });

    socket.on("reset", () => 
    {
        p1WantsWin = null;
        p2WantsWin = null;
        p1Won = null;
        p1ThinksP2WantsWin = null;
        p2ThinksP1WantsWin = null;
        p1Score = 0;
        p2Score = 0;

        io.emit("hide-choices");
        io.emit("update-score", p1Score, p2Score);

        console.log("Resetting game...");
    });
});

server.listen(3000, () => 
{
    console.log("Server running at http://localhost:3000");
});