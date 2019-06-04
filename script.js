
const MELEE = "melee";
const ULTIMATE = "ultimate";
const BRAWL = "brawl";

const DEFAULT_IMG = "./res/crazyhand.png";

var currentGameTitle = MELEE;

/* CONSTANTS */
const IMAGE_DIR = "./res/stocks"


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

// TODO: Also set up the range validation stuff?
// Actually I think I want to make that more dynamic regardless
// Like who cares about currying if there's a better and easier
//    solution available lol
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

  // Set up the input ranges?
}

function getImagePath(game, charImage) {
  return IMAGE_DIR + "/" + game.subdir + "/" + charImage;
}

// Make sure melee is checked
document.getElementById(MELEE).checked = true;



// Load the game data
var games = null;
var currentGame = null;
loadJSON((data) => {
  games = JSON.parse(data);
  setCurrentGame(MELEE);
});


function rangeValidationCurry(min, max) {
  return function(val) {
    return (val >= min && val <= max);
  }
}

const inputRanges = new Map([
  ["input-players", {low: 1, high: 4}],
  ["input-chars", {low: 1, high: 26}],
])

var inputFilters = [];

inputRanges.forEach(function(range, inputID) {
  inputFilters.push([inputID, rangeValidationCurry(range.low, range.high)]);
});

// Turn it into a map so we can index by ID
inputFilters = new Map(inputFilters);


// Event Handlers
function handleGenerateClick() {
  var numPlayers = document.getElementById("input-players").value;
  var numChars = document.getElementById("input-chars").value;

  // Do some basic input validation
  if (!isNumeric(numPlayers) || !isNumeric(numChars)) {
    alert("Please only input numbers");
  }

  // Now that they're numbers, we should do some validation on the ranges just to be safe
  numPlayers = parseInt(numPlayers);
  numChars = parseInt(numChars);
  // TODO: restructure data so that we validate ranges based on game state 
  // For now we'll just do the basic way though
  if (!inputFilters.get("input-players")(numPlayers) ||
      !inputFilters.get("input-chars")(numPlayers)) {
        alert("Input values are out of range!");
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


function validateRange(inputID) {
  var input = document.getElementById(inputID);
  var range = inputRanges.get(inputID);

  if (!range) return;

  console.log("yo");

  var value = input.value;

  if (isNumeric(value)) {
    value = parseInt(value);

    if (value < range.low) {
      input.value = range.low;
    } else if (value > range.high) {
      input.value = range.high;
    }

  } else {
    input.value = "1";
  }
}

function applyStepCurry(stepVal) {
  return function(inputID) {
    var input = document.getElementById(inputID);

    if (!input) return;

    var value = input.value;

    if (isNumeric(value)) {
      // Everything is good to go!
      value = parseInt(value);

      // Increment only if within range
      if (inputFilters.get(inputID)(value + stepVal)) {
        input.value = value + stepVal;
      } else {
        input.value = "1";
      }
    } else {
      input.value = "1";
    }
  }
}

var incField = applyStepCurry(1);
var decField = applyStepCurry(-1);



// Helper Functions
function isNumeric(value) {
  return !isNaN(value);
}


// I'm going to try to restrict the input on my own
// I'm going to steal that guy's strategy of using a higher order function tho

function applyInputFilter(filter, input) {
  // For every event we need to check the
  ["input"].forEach(function(event) {
    input.addEventListener(event, function(e) {
      // Test out the filter against the value
      if (filter(e.target.value) || !e.target.value) {

      } else if (this.hasOwnProperty("oldValue")) {

      } else {
        
      }
    });
  });
}

function applyInputFilterForID(id) {  
  applyInputFilter(inputFilters.get(id), document.getElementById(id));
}


applyInputFilterForID("input-players");


// Helper functions
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
  // TODO: Again, update to be more dynamic but w/e
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