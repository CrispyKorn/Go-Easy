const socket = io();

const preChoiceWin = document.getElementById("pre-choice-win");
const preChoiceLose = document.getElementById("pre-choice-lose");
const postResultWin = document.getElementById("post-result-win");
const postResultLose = document.getElementById("post-result-lose");
const postChoiceWin = document.getElementById("post-choice-win");
const postChoiceLose = document.getElementById("post-choice-lose");

const reveal = document.getElementById("reveal");
const nextRound = document.getElementById("next-round");
const resetGame = document.getElementById("reset");

preChoiceWin.addEventListener("click", () => 
{
    socket.emit("pre-choice-win");
});

preChoiceLose.addEventListener("click", () => 
{
    socket.emit("pre-choice-lose");
});

postResultWin.addEventListener("click", () => 
{
    socket.emit("post-result-win");
});

postResultLose.addEventListener("click", () => 
{
    socket.emit("post-result-lose");
});

postChoiceWin.addEventListener("click", () => 
{
    socket.emit("post-choice-win");
});

postChoiceLose.addEventListener("click", () => 
{
    socket.emit("post-choice-lose");
});

reveal.addEventListener("click", () => 
{
    socket.emit("reveal");
});

nextRound.addEventListener("click", () => 
{
    socket.emit("next-round");
});

resetGame.addEventListener("click", () => 
{
    socket.emit("reset");
});

socket.on("hide-hostonly-content", () => 
{
    document.querySelectorAll(".host-side").forEach(element => 
    {
        element.style.display = "none";
    });
});

socket.on("reveal-results", (p1Desire, p2Desire) => 
{
    document.getElementById("player-one-choice").innerText = p1Desire;
    document.getElementById("player-two-choice").innerText = p2Desire;
});