// Picross puzzle solver

// Solver class
function Solver(puzzleView, puzzleModel) {
    this.model = puzzleModel;
    this.view = puzzleView;
    this.height = this.model.attributes.dimensionHeight;
    this.width = this.model.attributes.dimensionWidth;

    this.solve = function () {
        console.log("Solving puzzle...");

        var changed = true;
        while (changed) {
            changed = false;
            for (var i = 0; i < this.height; i++) {
                changed |= this.trySolveRow(i);
            }

            for (var i = 0; i < this.width; i++) {
                changed |= this.trySolveCol(i);
            }
        }
    }

    this.trySolveRow = function (row) {
        console.log("Trying to solve row " + row);
        var allPossible = this.getPossibleRow(row);
        console.log(allPossible);

        // Find any guaranteed filled/empty positions
        // Where all possible rows have the same value, we know that the position is filled/empty
        var changed = false;
        if (allPossible.length > 0) {
            let knownEmpty = [];
            let knownFilled = [];
            for (var i = 0; i < this.width; i++) {
                knownEmpty.push(true);
                knownFilled.push(true);
            }
            for (var i = 0; i < allPossible.length; i++) {
                for (var j = 0; j < this.width; j++) {
                    if (allPossible[i][j] != 1) {
                        knownEmpty[j] = false;
                    }
                    if (allPossible[i][j] != 2) {
                        knownFilled[j] = false;
                    }
                }
            }
            var knownEmptyPositions = [];
            var knownFilledPositions = [];
            for (var i = 0; i < this.width; i++) {
                if (knownEmpty[i]) {
                    knownEmptyPositions.push(i);
                    if (this.model.attributes.state[row][i] != 1) {
                        changed = true;
                    }
                    this.makeGuess(row, i, 1);
                }
                else if (knownFilled[i]) {
                    knownFilledPositions.push(i);
                    if (this.model.attributes.state[row][i] != 2) {
                        changed = true;
                    }
                    this.makeGuess(row, i, 2);
                }
            }
            console.log("Known empty positions: " + knownEmptyPositions);
            console.log("Known filled positions: " + knownFilledPositions);
        }
        return changed;
    }

    this.trySolveCol = function (col) {
        console.log("Trying to solve col " + col);
        var allPossible = this.getPossibleCol(col);
        console.log(allPossible);

        // Find any guaranteed filled/empty positions
        // Where all possible rows have the same value, we know that the position is filled/empty
        var changed = false;
        if (allPossible.length > 0) {
            let knownEmpty = [];
            let knownFilled = [];
            for (var i = 0; i < this.height; i++) {
                knownEmpty.push(true);
                knownFilled.push(true);
            }
            for (var i = 0; i < allPossible.length; i++) {
                for (var j = 0; j < this.height; j++) {
                    if (allPossible[i][j] != 1) {
                        knownEmpty[j] = false;
                    }
                    if (allPossible[i][j] != 2) {
                        knownFilled[j] = false;
                    }
                }
            }
            var knownEmptyPositions = [];
            var knownFilledPositions = [];
            for (var i = 0; i < this.height; i++) {
                if (knownEmpty[i]) {
                    knownEmptyPositions.push(i);
                    if (this.model.attributes.state[i][col] != 1) {
                        changed = true;
                    }
                    this.makeGuess(i, col, 1);
                }
                else if (knownFilled[i]) {
                    knownFilledPositions.push(i);
                    if (this.model.attributes.state[i][col] != 2) {
                        changed = true;
                    }
                    this.makeGuess(i, col, 2);
                }
            }
            console.log("Known empty positions: " + knownEmptyPositions);
            console.log("Known filled positions: " + knownFilledPositions);
        }
        return changed;
    }

    this.getPossibleHelper = function (remainingHints, rowSoFar, lastPlaced, length) {
        if (remainingHints.length == 0) {
            console.log("no more hints");
            // Fill in the row with 1 (known empty)
            for (var i = 0; i < length; i++) {
                if (rowSoFar[i] == 0) {
                    rowSoFar[i] = 1;
                }
            }

            return [rowSoFar.slice()];
        }
        else {
            // Recurse on the next remaining hint
            remainingHints = remainingHints.slice();
            var nextHint = remainingHints.shift();
            console.log("trying to place: " + nextHint);

            // Figure out all possible locations for the next hint. The right most position is bounded by the length of the remaning hints (assuming they're all on the right)
            var maxRight = length - 1;
            for (var i = remainingHints.length - 1; i >= 0; i--) {
                maxRight -= remainingHints[i] + 1;
            }
            maxRight -= nextHint - 1; // Start position of next hint is the left most position of the next hint

            var minLeft = lastPlaced;
            // // Find the first 0 after the last known filled position
            // for (var i = 0; i <= maxRight; i++) {
            //     if (rowSoFar[i] == 2) {
            //         minLeft = i + 1;
            //     }
            // }
            console.log(rowSoFar);
            console.log("minLeft: " + minLeft);
            console.log("maxRight: " + maxRight);

            var possibleLocations = [];
            // For each possible position, recurse
            var oldRow = rowSoFar.slice();
            for (var i = minLeft; i <= maxRight; i++) {
                rowSoFar = oldRow.slice();
                // Attempt to place the next hint at this position
                var startPos = i;
                var endPos = i + nextHint;
                console.log("Placing " + nextHint + " at " + startPos + " to " + endPos);
                if (startPos > 0 && rowSoFar[startPos - 1] == 2) {
                    // If the position to the left of where we're about to place it is known to be filled, we can't place it there
                    // But if it's the left edge then it's fine
                    console.log("Can't place at start " + startPos + " because it's filled");
                    continue;
                }
                if (endPos < length && rowSoFar[endPos] == 2) {
                    // If the position to the right of where we're about to place it is known to be filled, we can't place it there
                    // But if it's the right edge then it's fine
                    console.log(rowSoFar);
                    console.log("Can't place at end " + endPos + " because it's filled");
                    continue;
                }
                // Check if there are any known empties in the positions we're about to place 
                var knownEmpty = false;
                for (var j = startPos; j < endPos; j++) {
                    if (rowSoFar[j] == 1) {
                        knownEmpty = true;
                        console.log("Can't place at " + j + " because it's empty");
                        break;
                    }
                }
                if (knownEmpty) {
                    continue;
                }
                // If we get here, we can place the next hint at this position
                // Create a copy of rowsSoFar with the next hint placed at this position and recurse
                var addedStuff = false;
                var newRowSoFar = rowSoFar.slice();
                for (var j = startPos; j < endPos; j++) {
                    if (j > 0 && j < length) { addedStuff = true; }
                    newRowSoFar[j] = 2;
                }
                if (startPos > 0) {
                    newRowSoFar[startPos - 1] = 1;
                }
                if (endPos < length) {
                    newRowSoFar[endPos] = 1;
                }
                if (addedStuff == false) {
                    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa");
                }
                var ret = this.getPossibleHelper(remainingHints.slice(), newRowSoFar.slice(), endPos, length);
                possibleLocations = possibleLocations.concat(ret);
            }
            return possibleLocations;
        }
    }

    this.getRemainingRowHints = function (row) {
        let hintsX = this.model.attributes.hintsX;
        var remainingHints = hintsX[row].slice();
        // Check to see if any hints are completed 
        if (remainingHints.length > 0) {
            var currentHint = 0;
            var streak = 0;
            var finishedHintIndices = []
            for (var i = 0; i < this.width; i++) {
                if (this.model.attributes.state[row][i] == 2) {
                    streak++;
                }
                else {
                    if (streak > 0) {
                        if (remainingHints[currentHint] == streak) {
                            finishedHintIndices.push(currentHint);
                            currentHint++;
                        }
                        streak = 0;
                    }
                }
            }
            streak = 0;
            currentHint = remainingHints.length - 1;
            for (var i = this.width - 1; i >= 0; i--) {
                if (this.model.attributes.state[row][i] == 2) {
                    streak++;
                }
                else {
                    if (streak > 0) {
                        if (remainingHints[currentHint] == streak) {
                            finishedHintIndices.push(currentHint);
                            currentHint--;
                        }
                        streak = 0;
                    }
                }
            }

            // Remove duplicates from finishedHintIndices and then remove the finished hints from remainingHints
            finishedHintIndices = finishedHintIndices.filter(function (item, pos) {
                return finishedHintIndices.indexOf(item) == pos;
            });
            for (var i = 0; i < finishedHintIndices.length; i++) {
                // remainingHints.splice(finishedHintIndices[i], 1);
            }
        }
        return remainingHints;
    }

    this.getRemainingColHints = function (col) {
        let hintsY = this.model.attributes.hintsY;
        var remainingHints = hintsY[col].slice();
        // Check to see if any hints are completed
        if (remainingHints.length > 0) {
            var currentHint = 0;
            var streak = 0;
            for (var i = 0; i < this.height; i++) {
                if (this.model.attributes.state[i][col] == 2) {
                    streak++;
                }
                else {
                    if (streak > 0) {
                        if (remainingHints[currentHint] == streak) {
                            remainingHints.splice(currentHint, 1); // Found a completed hint
                            currentHint++;
                        }
                        streak = 0;
                    }
                }
            }
            streak = 0;
            currentHint = remainingHints.length - 1;
            for (var i = this.height - 1; i >= 0; i--) {
                if (this.model.attributes.state[i][col] == 2) {
                    streak++;
                }
                else {
                    if (streak > 0) {
                        if (remainingHints[currentHint] == streak) {
                            remainingHints.splice(currentHint, 1); // Found a completed hint
                            currentHint--;
                        }
                        streak = 0;
                    }
                }
            }
        }
        return remainingHints;
    }


    this.getPossibleRow = function (row) {
        // Find all possible arrangements of the row given the hints and the current state of the board
        // 0 means unknown, 1 means known empty, 2 means known filled
        let possibleRow = [];
        for (var i = 0; i < this.width; i++) {
            possibleRow.push(this.model.attributes.state[row][i]);
        }
        let remainingHints = this.getRemainingRowHints(row);
        return this.getPossibleHelper(remainingHints, possibleRow, 0, this.width);
    }

    this.getPossibleCol = function (col) {
        let hintsY = this.model.attributes.hintsY;
        let possibleCol = [];
        for (var i = 0; i < this.height; i++) {
            possibleCol.push(this.model.attributes.state[i][col]);
        }
        let remainingHints = hintsY[col].slice();
        return this.getPossibleHelper(remainingHints, possibleCol, 0, this.height);
    }



    this.makeGuess = function (x, y, val) {
        let state = this.model.attributes.state;
        state[x][y] = val;
        this.model.set({ state: state });
        // this.model.guess(x, y, val);
        this.model.updateCrossouts(state, x, y);
        this.view.render();
    }
};


$(document).ready(function () {
    let view = window.puzzleView;
    let model = window.puzzleView.model;
    let state = model.attributes.state;

    console.log(model.attributes)

    window.solver = new Solver(view, model);
});

// Solve on space bar
$(document).keydown(function (e) {
    if (e.keyCode == 32) {
        window.solver.solve();
    }
});