class ToggleElement
{
    element;
    #visibleTag;

    constructor(element, visibleTag)
    {
        this.element = element;
        this.visibleTag = visibleTag;
    }

    setVisibility(visible)
    {
        this.element.style.display = visible ? this.visibleTag : "none";
    }
}

const socket = io();

const preChoiceWin = document.getElementById("pre-choice-win");
const preChoiceLose = document.getElementById("pre-choice-lose");
const postResultWin = document.getElementById("post-result-win");
const postResultLose = document.getElementById("post-result-lose");
const postChoiceWin = document.getElementById("post-choice-win");
const postChoiceLose = document.getElementById("post-choice-lose");

const nextRound = new ToggleElement(document.getElementById("next-round"), "inline-block");
const resetGame = new ToggleElement(document.getElementById("reset"), "inline-block");

const sectionOne = new ToggleElement(document.getElementById("section-one"), "block");
const sectionTwo = new ToggleElement(document.getElementById("section-two"), "block");
const sectionThree = new ToggleElement(document.getElementById("section-three"), "block");
const sectionFour = new ToggleElement(document.getElementById("section-four"), "block");
const sectionFive = new ToggleElement(document.getElementById("section-five"), "block");
const sectionSix = new ToggleElement(document.getElementById("section-six"), "block");
const sectionWaiting = new ToggleElement(document.getElementById("section-waiting"), "block");
const waitingforPlayer = document.getElementById("waiting-for-player");
const player = document.getElementById("player");

let isPlayerOne = false;

preChoiceWin.addEventListener("click", () => socket.emit("pre-choice", true));
preChoiceLose.addEventListener("click", () => socket.emit("pre-choice", false));
postResultWin.addEventListener("click", () => socket.emit("post-result", true));
postResultLose.addEventListener("click", () => socket.emit("post-result", false));
postChoiceWin.addEventListener("click", () => socket.emit("post-choice", true));
postChoiceLose.addEventListener("click", () => socket.emit("post-choice", false));
nextRound.element.addEventListener("click", () => socket.emit("next-round"));
resetGame.element.addEventListener("click", () => socket.emit("reset"));

socket.on("set-playerOne", () => 
{
    isPlayerOne = true;
});

socket.on("initialize", () => 
{
    hideAllContent();

    waitingforPlayer.innerHTML = `Waiting for Player ${isPlayerOne ? 2 : 1}...`;
    player.innerHTML = `Player ${isPlayerOne ? 1 : 2}`;
    nextRound.setVisibility(false);

    sectionOne.setVisibility(true);
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
});

socket.on("update-score", (p1Score, p2Score) => 
{
    document.getElementById("player-one-score").innerHTML = p1Score;
    document.getElementById("player-two-score").innerHTML = p2Score;
});

socket.on("client-choice", (choice) => 
{
    document.getElementById("client-choice").innerHTML = choice;
    hideAllContent(true);
});

socket.on("client-result", (result) => 
{
    document.getElementById("client-result").innerHTML = result;
});

socket.on("client-guess", (guess) => 
{
    document.getElementById("client-guess").innerHTML = guess;
    hideAllContent(true);
});

socket.on("phase-complete", (phase) => 
{
    hideAllContent(false);
    MoveToSection(phase + 1);
    console.log(`Moving to phase ${phase}.`);
});

socket.on("lobby-full", () => 
{
    document.querySelector("main").style.display = "none";
    player.innerHTML = "Lobby full. :( <br/><br/>Try again later."
});

function MoveToSection(section)
{
    switch (section)
    {
        case 2: 
        {
            if (isPlayerOne) sectionTwo.setVisibility(true);
            else sectionWaiting.setVisibility(true);
        }
        break;
        case 3: 
        {
            sectionThree.setVisibility(true);
        }
        break;
        case 4: 
        {
            sectionFour.setVisibility(true);
            nextRound.setVisibility(true);
        }
        break;
    }
}

function hideAllContent(waiting)
{
    sectionOne.setVisibility(false);
    sectionTwo.setVisibility(false);
    sectionThree.setVisibility(false);
    sectionFour.setVisibility(false);
    sectionWaiting.setVisibility(waiting);
}