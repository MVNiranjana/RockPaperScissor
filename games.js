let userScore = 0;
let compScore = 0;

// Helper function to capitalize first letter
const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Select all choices
const choices = document.querySelectorAll(".choice");
const msg=document.querySelector("#content");
const change=document.querySelector(".msg");
const uScore=document.querySelector("#userScore");
const cScore=document.querySelector("#compScore");
const userMoveDisplay=document.querySelector("#userMoveDisplay");
const compMoveDisplay=document.querySelector("#compMoveDisplay");


// Add event listener to each choice
choices.forEach((choice) => {
    choice.addEventListener("click", () => {
        const userChoice = choice.id;
        playGame(userChoice);
    });
});

// Function to display move visually
const displayMove = (moveDisplay, choice) => {
    // Clear previous content
    moveDisplay.innerHTML = '';
    
    // Create and add image
    const img = document.createElement('img');
    // Handle mapping: scissor -> scissors.png
    const imageName = choice === 'scissor' ? 'scissors.png' : `${choice}.png`;
    img.src = imageName;
    img.alt = capitalizeFirst(choice === 'scissor' ? 'scissors' : choice);
    moveDisplay.appendChild(img);
};

// Play the game
const playGame = (userChoice) => {
    // Normalize user choice: scissor -> scissors
    const normalizedUserChoice = userChoice === 'scissor' ? 'scissors' : userChoice;
    
    console.log("User choice:", normalizedUserChoice);
    const compChoice = genCompChoice();
    console.log("Computer choice:", compChoice);

    // Display both moves visually
    displayMove(userMoveDisplay, userChoice);
    displayMove(compMoveDisplay, compChoice);

    if (normalizedUserChoice === compChoice) {
        console.log("It's a tie!");
        msg.innerText="It's a Tie!";
        msg.style.backgroundColor="yellow";
        change.style.backgroundColor="yellow";
        
        
       return;
    }

    let userWin = true;

    if (normalizedUserChoice === "rock") {
        userWin = compChoice === "paper" ? false : true;
    } else if (normalizedUserChoice === "paper") {
        userWin = compChoice === "scissors" ? false : true;
    } else {
        userWin = compChoice === "rock" ? false : true;
    }

    showWinner(userWin, normalizedUserChoice, compChoice);
};

// Show winner and update scores
const showWinner = (userWin, userChoice, compChoice) => 
{
    if (userWin) {
        userScore++;
        console.log("You win!");
        msg.innerText="You Win!";
        msg.style.backgroundColor="green";
        change.style.backgroundColor="green";
        uScore.innerText=userScore;
       
    } else {
        compScore++;
        console.log("You lose!");
        msg.innerText="You Lose!";
        msg.style.backgroundColor="red";
        change.style.backgroundColor="red";
        cScore.innerText=compScore;
       
    }
};

// Generate random computer choice
const genCompChoice = () => {
    const options = ["rock", "paper", "scissors"];
    const ranIdx = Math.floor(Math.random() * 3);
    return options[ranIdx];
};


