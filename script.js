const numberOfDecks = 1; // Number of decks to use
let deckId; // Store the deck ID
let playerHand = [];
let dealerHand = [];

const dealButton = document.getElementById("deal-button");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const message = document.getElementById("message");
const playerCards = document.getElementById("player-cards");
const dealerCards = document.getElementById("dealer-cards");
const playerScoreDisplay = document.getElementById("player-score");
const dealerScoreDisplay = document.getElementById("dealer-score");

// Function to create a new deck using the API
async function createDeck() {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${numberOfDecks}`
  );
  const data = await response.json();
  deckId = data.deck_id;
}

// Function to draw cards from a deck using the API
async function drawCards(deckId, numberOfCards) {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numberOfCards}`
  );
  const data = await response.json();
  return data.cards;
}

// Function to deal initial cards to the player and dealer
async function dealInitialCards() {
  playerHand = await drawCards(deckId, 2);
  dealerHand = await drawCards(deckId, 2);
}

// Function to draw a card for the player
async function hitPlayer() {
  const card = await drawCards(deckId, 1);
  playerHand.push(card[0]);
  displayCardImages(playerHand, "player-cards");
  updatePlayerScore();
}

// Function to draw a card for the dealer
async function hitDealer() {
  const card = await drawCards(deckId, 1);
  dealerHand.push(card[0]);
  displayCardImages(dealerHand, "dealer-cards");
  updateDealerScore();
}

// Function to calculate the value of a hand
function calculateHandValue(hand) {
  let value = 0;
  let numAces = 0;

  for (const card of hand) {
    value += getValueOfCard(card);
    if (card.value === "ACE") {
      numAces++;
    }
  }

  // Adjust for Aces
  while (numAces > 0 && value > 21) {
    value -= 10;
    numAces--;
  }

  return value;
}

// Function to get the numeric value of a card
function getValueOfCard(card) {
  if (["KING", "QUEEN", "JACK"].includes(card.value)) {
    return 10;
  } else if (card.value === "ACE") {
    return 11; // Start with 11; adjust later if needed
  } else {
    return parseInt(card.value);
  }
}

// Function to display card images
function displayCardImages(hand, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (const card of hand) {
    const img = document.createElement("img");
    img.src = card.image;
    img.alt = `${card.value} of ${card.suit}`;
    container.appendChild(img);
  }
}

// Function to update player's score
function updatePlayerScore() {
  const playerValue = calculateHandValue(playerHand);
  playerScoreDisplay.textContent = `Score: ${playerValue}`;
}

// Function to update dealer's score
function updateDealerScore() {
  const dealerValue = calculateHandValue(dealerHand);
  dealerScoreDisplay.textContent = `Score: ${dealerValue}`;
}

// Event listeners for buttons
dealButton.addEventListener("click", async () => {
  // reset Hit and Stand buttons
  hitButton.disabled = false;
  standButton.disabled = false;

  await createDeck();
  await dealInitialCards();
  displayCardImages(playerHand, "player-cards");
  displayCardImages(dealerHand, "dealer-cards");
  updatePlayerScore();
  updateDealerScore();
  message.textContent = "";
});

hitButton.addEventListener("click", async () => {
  if (calculateHandValue(playerHand) < 21) {
    await hitPlayer();
    if (calculateHandValue(playerHand) >= 21) {
      endGame();
    }
  }
});

standButton.addEventListener("click", async () => {
  if (calculateHandValue(playerHand) < 21) {
    while (calculateHandValue(dealerHand) < 17) {
      await hitDealer();
    }
    endGame();
  }
});

// Function to end the game and determine the winner
function endGame() {
  hitButton.disabled = true;
  standButton.disabled = true;

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  if (playerValue > 21) {
    message.textContent = "Dealer wins - Player busted!";
  } else if (dealerValue > 21) {
    message.textContent = "Player wins - Dealer busted!";
  } else if (playerValue === 21 || playerValue > dealerValue) {
    message.textContent = "Player wins!";
  } else if (playerValue < dealerValue) {
    message.textContent = "Dealer wins!";
  } else {
    message.textContent = "It's a tie! House wins";
  }
}

// Initialize the game
dealButton.click();
