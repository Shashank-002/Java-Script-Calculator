let displayValue = '';
let dotUsed = false;
let lastInputOperator = false;
let resultShown = false;
let errorState = false;
let formatError = false;
let firstMinusUsed = false; 
let lastOperator = false; 

function appendToDisplay(value) {
    const operators = ['+', '-', '*', '/'];

    // Handle error states
    if (errorState || formatError) {
        if (isDigit(value) || value === '.' || value === '-') {
            clearDisplay(); // Clear on any valid input
            errorState = false;
            formatError = false;
        }
    }

    // Reset if result is shown and number or '.' is pressed
    if (resultShown && (isDigit(value) || value === '.')) {
        clearDisplay();
        resultShown = false;
    } else if (resultShown && operators.includes(value)) {
        resultShown = false;
    }

    // Block the first operator click for '+', '*', '/'
    if (!displayValue && ['+', '*', '/'].includes(value)) {
        return;  
    }

    // Handle the '-' operator being used first and another operator after
    if (firstMinusUsed && operators.includes(value) && value !== '-') {
        clearDisplay();  
        firstMinusUsed = false; 
        return; 
    }

    if (firstMinusUsed && isDigit(value)) {
        firstMinusUsed = false;
    }

    if (isDigit(value) || value === '.') {
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

        // Track if the '-' operator is used first
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
    lastOperator = lastInputOperator; // Update lastOperator
    dotUsed = displayValue.includes('.');
});

// Clear display
function clearDisplay() {
    displayValue = '';
    dotUsed = false;
    lastInputOperator = false;
    firstMinusUsed = false; 
    lastOperator = false; 
    document.getElementById('display').value = displayValue;
}

// Calculation
function calculate() {
    const operators = ['+', '-', '*', '/'];

    // Check if display is empty
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

    // Check for a trailing dot followed by an operator
    if (displayValue.endsWith('.') && displayValue.length > 1 && operators.includes(displayValue[displayValue.length - 2])) {
        document.getElementById('display').value = "Format error"; 
        formatError = true; 
        return;
    }

    // Try-catch block for performing the calculation
    try {
        let tokens = tokenize(displayValue);
        tokens = handlePrecedence(tokens, ['*', '/']);
        let result = handlePrecedence(tokens, ['+', '-'])[0];

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


// Helper functions
function tokenize(input) {
    let tokens = [];
    let currentNumber = '';
    let previousChar = null;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];

        if (isDigit(char) || char === '.') {
            currentNumber += char;
        } else {
            if (currentNumber) {
                tokens.push(parseFloat(currentNumber));
                currentNumber = '';
            }

            if (char === '-' && (previousChar === null || !isDigit(previousChar))) {
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

function isDigit(char) {
    return /\d/.test(char);
}

function handlePrecedence(tokens, operators) {
    let newTokens = [];
    let i = 0;

    while (i < tokens.length) {
        let token = tokens[i];

        if (typeof token === 'number') {
            newTokens.push(token);
        } else if (operators.includes(token)) {
            let num1 = newTokens.pop();
            let num2 = tokens[++i];
            newTokens.push(operate(num1, num2, token));
        } else {
            newTokens.push(token);
        }
        i++;
    }

    return newTokens;
}

function operate(num1, num2, operation) {
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
