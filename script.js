
const MELEE = "melee";
const ULTIMATE = "ultimate";
const BRAWL = "brawl";

const DEFAULT_IMG = "./res/crazyhand.png";

var currentGameTitle = MELEE;

/* CONSTANTS */
const IMAGE_DIR = "./res/stocks"

const PLAYER_INPUT = "select-players";
const CHARS_INPUT = "select-chars";

const MAX_CHARS = 100;
const DEFAULT_CHARS = 5;


/* Files */
const GAMES_DATA = "res/games.json";


function loadJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', GAMES_DATA, true);
  xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
      }
  }

  xobj.send(null);
}


function setCurrentGame(gameTitle) {
  switch (gameTitle) {
    case MELEE:
      currentGameTitle = MELEE;
      currentGame = games.melee;
      break;
    case ULTIMATE:
      currentGameTitle = ULTIMATE;
      currentGame = games.ultimate;
      break;
    case BRAWL:
      currentGameTitle = BRAWL;
      currentGame = games.brawl;
    default:
      break;
  }

  // Make sure the character select input gets trimmed properly
  var charsSelect = document.getElementById("select-chars");
  var children = charsSelect.children;

  [].forEach.call(children, (child, index) => {
    var shouldHide = index >= currentGame.chars.length;
    
    child.classList.toggle("hidden", shouldHide);
  });

  if (DEFAULT_CHARS <= currentGame.chars.length) {
    charsSelect.value = DEFAULT_CHARS;
  }
}

function getImagePath(game, charImage) {
  return IMAGE_DIR + "/" + game.subdir + "/" + charImage;
}

// Make sure melee is checked
document.getElementById(MELEE).checked = true;

// Set up the spinner!
// I'm just going to put in a hard coded max of items
// I'll have to revisit how I'm storing the game data
var charsSelect = document.getElementById(CHARS_INPUT);

for (var i = 0; i < MAX_CHARS; i++) {
  // Create the new option
  var option = document.createElement("option");
  var value = i + 1;
  option.setAttribute("value", value);
  option.appendChild(document.createTextNode(value));
  
  charsSelect.appendChild(option);
}


// Load the game data
var games = null;
var currentGame = null;

loadJSON((data) => {
  games = JSON.parse(data);
  setCurrentGame(MELEE);
});



// Event Handlers
function handleGenerateClick() {
  var numPlayers = document.getElementById(PLAYER_INPUT).value;
  var numChars = document.getElementById(CHARS_INPUT).value;

  // Do some basic input validation
  if (!isNumeric(numPlayers) || !isNumeric(numChars)) {
    alert("Please only input numbers");
  }

  // Now that they're numbers, we should do some validation on the ranges just to be safe
  numPlayers = parseInt(numPlayers);
  numChars = parseInt(numChars);

  if (!playersAndCharsAreValid(numPlayers, numChars)) {
        alert("Input values are out of range!");
        return;
  }

  // Otherwise we're finally good to go!
  generateRosters(numPlayers, numChars);
}

function changeGame(game) {
  if (game !== currentGameTitle) {
    console.log("Setting new current game");
    
    setCurrentGame(game);
  }

}

// Helper Functions
function isNumeric(value) {
  return !isNaN(value);
}

function playersAndCharsAreValid(numPlayers, numChars) {
  return (
    isNumeric(numPlayers) &&
    isNumeric(numChars) &&
    numPlayers >= 1 &&
    numChars >= 1 &&
    numPlayers <= 4 &&
    numChars <= currentGame.chars.length
  );
}


function joinImagePath(baseDir, subdir, fileName) {
  return baseDir + "/" + subdir + "/" + fileName;
}

function generateRosters(numPlayers, numChars) {
  var rosters = document.getElementById("rosters");
  rosters.innerHTML = "";

  // Generate a roster for each player
  for (var player = 0; player < numPlayers; player++) {
    // Create the roster parent
    var rosterParent = document.createElement("div");
    rosterParent.classList.add("roster-parent");

    // Add the player label
    var playerLabelContainer = document.createElement("div");
    playerLabelContainer.classList.add("player-label");
    var playerLabel = document.createElement("h1");
    playerLabel.appendChild(document.createTextNode("Player " + (player + 1) + ":"))
    playerLabelContainer.appendChild(playerLabel);
    rosterParent.appendChild(playerLabelContainer);

    // Create a spot for the roster
    var currentRoster = document.createElement("div");
    currentRoster.classList.add("roster-container");    
    var rosterID = "player-" + player;
    currentRoster.id = rosterID;

    // Add the roster to the parent
    rosterParent.appendChild(currentRoster);

    // Create the shuffle button
    var buttonContainer = createShuffleButton(rosterID, numChars);

    // Add the shuffle button to the parent
    rosterParent.appendChild(buttonContainer);

    // Add the parent to the list of all rosters
    rosters.appendChild(rosterParent);

    // Fill the roster
    fillRoster(rosterID, numChars);
  }
}

function createShuffleButton(rosterID, numChars) {
  var buttonContainer = document.createElement("div");
  buttonContainer.classList.add("shuffle-parent");
  var button = document.createElement("button");
  button.classList.add("shuffle");
  button.onclick = () => fillRoster(rosterID, numChars);
  button.innerText = "Shuffle";

  // Add the button to it's container
  buttonContainer.appendChild(button);

  return buttonContainer;
}




function fillRoster(rosterID, numChars) {
  var roster = document.getElementById(rosterID);
  if (!roster) {
    console.log("Error!  Roster with ID: [" + rosterID + "] not found!");
    return;
  }

  // Create the character icons
  var rosterCharacters = getCharacters(numChars);
  var characterIcons = [];

  // Make a cool temp list :)
  rosterCharacters.forEach(character => {
    var characterContainer = document.createElement("div");
    characterContainer.classList.add("character-container");
    characterContainer.classList.add(currentGameTitle);

    characterContainer.appendChild(getStockIcon(currentGame, character));

    characterIcons.push(characterContainer);
  });

  // Clear the contents of the roster
  roster.innerHTML = "";
  // Then add the images!
  characterIcons.forEach(icon => {
    roster.appendChild(icon);
  })
}

function getStockIcon(game, characterIndex) {
  var charImage = game.chars[characterIndex];
  var fileName = getImagePath(game, charImage);
  var img = new Image;
  img.classList.add("stock-icon");
  img.classList.add(currentGameTitle);
  img.src = fileName;

  return img;
}

function getCharacters(numChars) {
  // This is where we can do some sick random number stuff
  
  var indices = [];
  var characters = currentGame.chars;

  for (var i = 0 ; i < characters.length; i++) {
    indices.push(i);
  }

  shuffle(indices);

  indices = indices.filter((_, index) => index < numChars);

  return indices;
}

function shuffle(array) {
  var count = array.length;

  while (count > 0) {
    // Pick a random index to swap
    var index = Math.floor(Math.random() * count);

    count--;

    // Swap the elements at the specified indices
    var temp = array[count]
    array[count] = array[index];
    array[index] = temp;
  }

  return array;
}