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

const sectionOne = document.getElementById("section-one");
const sectionTwo = document.getElementById("section-two");
const sectionThree = document.getElementById("section-three");
const sectionFour = document.getElementById("section-four");
const sectionFive = document.getElementById("section-five");
const sectionSix = document.getElementById("section-six");

let isPlayerOne = false;

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

socket.on("set-playerOne", () => 
{
    isPlayerOne = true;
});

socket.on("hide-choices", () => 
{
    sectionOne.style.display = "block";
    document.getElementById("choices").style.display = "none";
    sectionTwo.style.display = "none";
    sectionThree.style.display = "none";
    sectionFour.style.display = "none";
    nextRound.style.display = "none";
    if (isPlayerOne) document.getElementById("reveal").style.display = "inline-block";
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
    document.getElementById("player-one-choice").innerHTML = p1Desire;
    document.getElementById("player-two-choice").innerHTML = p2Desire;

    MoveToSection(5);
});

socket.on("update-score", (p1Score, p2Score) => 
{
    document.getElementById("player-one-score").innerHTML = p1Score;
    document.getElementById("player-two-score").innerHTML = p2Score;
});

socket.on("client-choice", (choice) => 
{
    document.getElementById("client-choice").innerHTML = choice;
    MoveToSection(2);
});

socket.on("client-result", (result) => 
{
    document.getElementById("client-result").innerHTML = result;
    MoveToSection(3);
});

socket.on("client-guess", (guess) => 
{
    document.getElementById("client-guess").innerHTML = guess;
    MoveToSection(4);
});

function MoveToSection(section)
{
    switch (section)
    {
        case 2: 
        {
            sectionOne.style.display = "none";

            if (isPlayerOne) sectionTwo.style.display = "block";
        }
        break;
        case 3: 
        {
            if (isPlayerOne) sectionTwo.style.display = "none";

            sectionThree.style.display = "block";
        }
        break;
        case 4: 
        {
            sectionThree.style.display = "none";

            if (isPlayerOne) sectionFour.style.display = "block";
            
        }
        break;
        case 5: 
        {
            if (isPlayerOne) document.getElementById("reveal").style.display = "none";
            document.getElementById("choices").style.display = "flex";
            nextRound.style.display = "inline-block";
        }
        break;
    }
}