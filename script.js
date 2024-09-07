let displayValue = '';
let dotUsed = false;
let lastInputOperator = false;
let resultShown = false;
let errorState = false;
let formatError = false;
let firstMinusUsed = false; 
let lastOperator = false; 

// Adds the given value (number or operator) to the display
function addToDisplay(value) {
    const operators = ['+', '-', '*', '/'];

    // Handle error states
    if (errorState || formatError) {
        if (isNumber(value) || value === '.' || value === '-') {
            resetDisplay(); // Clear on any valid input
            errorState = false;
            formatError = false;
        }
    }

    // Reset display after result is shown
    if (resultShown && (isNumber(value) || value === '.')) {
        resetDisplay();
        resultShown = false;
    } else if (resultShown && operators.includes(value)) {
        resultShown = false;
    }

    // Block the first operator click for '+', '*', '/'
    if (!displayValue && ['+', '*', '/'].includes(value)) {
        return;  
    }

    // Handle the first '-' operator and prevent multiple operators
    if (firstMinusUsed && operators.includes(value) && value !== '-') {
        resetDisplay();  
        firstMinusUsed = false; 
        return; 
    }

    if (firstMinusUsed && isNumber(value)) {
        firstMinusUsed = false;
    }

    // Add numbers and dots to the display
    if (isNumber(value) || value === '.') {
        if (value === '.') {
            if (!dotUsed) {
                displayValue += value;
                dotUsed = true;
            }
        } else {
            displayValue += value;
        }
        lastInputOperator = false;
        lastOperator = false; 
    } else if (operators.includes(value)) {

        // Handle initial '-' operator
        if (value === '-' && displayValue === '') {
            firstMinusUsed = true; 
            displayValue += value; 
        } else if (lastInputOperator) {
            displayValue = displayValue.slice(0, -1) + value;
        } else {
            displayValue += value;
        }

        lastInputOperator = true;
        lastOperator = true; 
        dotUsed = false;
    }

    document.getElementById('display').value = displayValue;
    const inputField = document.getElementById('display');
    inputField.scrollLeft = inputField.scrollWidth;
}

// Prevent invalid key presses
document.getElementById('display').addEventListener('keypress', function (e) {
    const validChars = '0123456789+-*/.';
    const char = String.fromCharCode(e.which);

    if (char === '=' || !validChars.includes(char)) {
        e.preventDefault();
        return;
    }

    if (char === '.' && dotUsed) {
        e.preventDefault();
    } else if (!displayValue && ['+', '*', '/'].includes(char)) {
        e.preventDefault();
    } else if (lastInputOperator && char === '.') {
        e.preventDefault();
    }
});

// Handle manual input edits
document.getElementById('display').addEventListener('input', function (e) {
    const validInput = e.target.value.replace(/[^0-9+\-*/.]/g, '');
    e.target.value = validInput;
    displayValue = validInput;

    lastInputOperator = /[+\-*/]$/.test(displayValue);
    lastOperator = lastInputOperator;
    dotUsed = displayValue.includes('.');
});

// Reset the display to an empty state
function resetDisplay() {
    displayValue = '';
    dotUsed = false;
    lastInputOperator = false;
    firstMinusUsed = false; 
    lastOperator = false; 
    document.getElementById('display').value = displayValue;
}

// Perform the calculation based on the current input
function performCalculation() {
    const operators = ['+', '-', '*', '/'];

    if (displayValue === '') {
        document.getElementById('display').value = ''; 
        return;
    }

    if (displayValue === '.') {
        document.getElementById('display').value = displayValue; 
        formatError = true;  
        return;
    }

    if (operators.includes(displayValue[displayValue.length - 1])) {
        document.getElementById('display').value = displayValue; 
        formatError = true;  
        return;  
    }

    if (displayValue.endsWith('.') && displayValue.length > 1 && operators.includes(displayValue[displayValue.length - 2])) {
        document.getElementById('display').value = "Format error"; 
        formatError = true; 
        return;
    }

    try {
        let tokens = splitInputIntoTokens(displayValue);
        tokens = handleOperatorPrecedence(tokens, ['*', '/']);
        let result = handleOperatorPrecedence(tokens, ['+', '-'])[0];

        if (!isFinite(result)) {
            document.getElementById('display').value = "Can't divide by zero";
            errorState = true;
            return;
        }

        if (typeof result === 'number' && result % 1 !== 0) {
            result = result.toFixed(2);  // Limit to 2 decimal places for non-integers
        }

        displayValue = result.toString();
        document.getElementById('display').value = displayValue;
        resultShown = true;
        dotUsed = false;
        lastInputOperator = false;
        lastOperator = false; 
    } catch (error) {
        document.getElementById('display').value = 'Error';
        displayValue = '';
    }
}

// Extract tokens (numbers and operators) from the input
function splitInputIntoTokens(input) {
    let tokens = [];
    let currentNumber = '';
    let previousChar = null;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];

        if (isNumber(char) || char === '.') {
            currentNumber += char;
        } else {
            if (currentNumber) {
                tokens.push(parseFloat(currentNumber));
                currentNumber = '';
            }

            if (char === '-' && (previousChar === null || !isNumber(previousChar))) {
                currentNumber = '-';
            } else {
                tokens.push(char);
            }
        }
        previousChar = char;
    }

    if (currentNumber) {
        tokens.push(parseFloat(currentNumber));
    }

    return tokens;
}

// Check if the character is a number
function isNumber(char) {
    return /\d/.test(char);
}

// Handle operator precedence (e.g., multiply/divide before add/subtract)
function handleOperatorPrecedence(tokens, operators) {
    let newTokens = [];
    let i = 0;

    while (i < tokens.length) {
        let token = tokens[i];

        if (typeof token === 'number') {
            newTokens.push(token);
        } else if (operators.includes(token)) {
            let num1 = newTokens.pop();
            let num2 = tokens[++i];
            newTokens.push(performOperation(num1, num2, token));
        } else {
            newTokens.push(token);
        }
        i++;
    }

    return newTokens;
}

// Perform the mathematical operation
function performOperation(num1, num2, operation) {
    switch (operation) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '*':
            return num1 * num2;
        case '/':
            return num1 / num2;
        default:
            return num2;
    }
}
