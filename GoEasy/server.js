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

    assignPlayer(socket);
    console.log(`p1Id: ${p1Id}, p2Id: ${p2Id}`);

    io.emit("initialize");

    socket.on("disconnect", () => 
    {
        handleDisconnect(socket);
    });

    // Interaction events

    socket.on("pre-choice", (value) => 
    {
        setChoice(socket, value);
    });

    socket.on("post-result", (value) => 
    {
        setResult(socket, value);
    });

    socket.on("post-choice", (value) => 
    {
        setGuess(socket, value);
    });

    socket.on("next-round", () => 
    {
        moveToNextRound();
    });

    socket.on("reset", () => 
    {
        resetGame();
    });
});

server.listen(3000, () => 
{
    console.log("Server running at http://localhost:3000");
});


function assignPlayer(socket)
{
    if (p1Id === 0) 
    {
        p1Id = socket.id;
        socket.emit("set-playerOne");
    }
    else if (p2Id === 0) 
    {
        p2Id = socket.id;
        
        socket.emit("hide-hostonly-content");
    }
    else 
    {
        console.log(`${socket.id} was disconnected due to a full lobby.`);
        socket.emit("lobby-full");
        socket.disconnect(true);
    }
}

function setChoice(socket, value)
{
    let isP1 = socket.id === p1Id;
    if (isP1) p1WantsWin = value;
    else p2WantsWin = value;

    socket.emit("client-choice", isP1 ? (p1WantsWin ? "win" : "lose") : (p2WantsWin ? "win" : "lose"));

    console.log(`P1 wants win: ${p1WantsWin} | P2 wants win: ${p2WantsWin}`);

    if (p1WantsWin != null && p2WantsWin != null) io.emit("phase-complete", 1);
}

function setResult(socket, value)
{
    p1Won = value;

    socket.emit("client-result", p1Won ? "won" : "lost");
    socket.broadcast.emit("client-result", p1Won ? "lost" : "won");

    console.log(`P1 won: ${p1Won}`);

    io.emit("phase-complete", 2);
}

function setGuess(socket, value)
{
    let isP1 = socket.id === p1Id;
    if (isP1) p1ThinksP2WantsWin = value;
    else p2ThinksP1WantsWin = value;

    socket.emit("client-guess", isP1 ? (p1ThinksP2WantsWin ? "win" : "lose") : (p2ThinksP1WantsWin ? "win" : "lose"));

    console.log(`P1 thinks P2 wanted to win: ${p1ThinksP2WantsWin} | P2 thinks P1 wanted to win: ${p2ThinksP1WantsWin}`);

    if (p1ThinksP2WantsWin != null && p2ThinksP1WantsWin != null) 
    {
        io.emit("phase-complete", 3);
        revealResults();
    }
}

function revealResults()
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
}

function moveToNextRound()
{
    p1WantsWin = null;
    p2WantsWin = null;
    p1Won = null;
    p1ThinksP2WantsWin = null;
    p2ThinksP1WantsWin = null;

    io.emit("initialize");
    io.emit("update-score", p1Score, p2Score);

    console.log("Moving to next round...");
}

function resetGame()
{
    p1WantsWin = null;
    p2WantsWin = null;
    p1Won = null;
    p1ThinksP2WantsWin = null;
    p2ThinksP1WantsWin = null;
    p1Score = 0;
    p2Score = 0;

    io.emit("initialize");
    io.emit("update-score", p1Score, p2Score);

    console.log("Resetting game...");
}

function handleDisconnect(socket)
{
    console.log("User disconnected: ", socket.id);

    if (socket.id === p1Id) p1Id = 0;
    else if (socket.id === p2Id) p2Id = 0;

    console.log(`p1Id: ${p1Id}, p2Id: ${p2Id}`);
}