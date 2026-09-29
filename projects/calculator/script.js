let input = document.getElementById('inputBox');
let buttons = document.querySelectorAll('button');

let string = "";
let arr = Array.from(buttons);

// Button click functionality
arr.forEach(button => {
    button.addEventListener('click', (e) => {
        const value = e.target.innerHTML;
        
        try {
            if (value === '=') {
                // Evaluate the expression
                if (string) {
                    string = eval(string).toString();
                    input.value = string;
                }
            }
            else if (value === 'AC') {
                // Clear all
                string = "";
                input.value = "0";
            }
            else if (value === 'DEL') {
                // Delete last character
                string = string.substring(0, string.length - 1);
                input.value = string || "0";
            }
            else {
                // Append to string
                if (input.value === "0" && value !== ".") {
                    string = value;
                } else {
                    string += value;
                }
                input.value = string;
            }
        } catch (error) {
            // Handle invalid expressions
            input.value = "Error";
            string = "";
            setTimeout(() => {
                input.value = "0";
            }, 1500);
        }
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    // Prevent default for calculator keys
    if (['Enter', 'Escape', '='].includes(key)) {
        e.preventDefault();
    }
    
    // Numbers and operators
    if ((key >= '0' && key <= '9') || key === '.' || key === '+' || key === '-' || key === '*' || key === '/' || key === '%') {
        if (input.value === "0" && key !== ".") {
            string = key;
        } else {
            string += key;
        }
        input.value = string;
    }
    
    // Enter key or equals for calculation
    if (key === 'Enter' || key === '=') {
        try {
            if (string) {
                string = eval(string).toString();
                input.value = string;
            }
        } catch (error) {
            input.value = "Error";
            string = "";
            setTimeout(() => {
                input.value = "0";
            }, 1500);
        }
    }
    
    // Backspace for delete
    if (key === 'Backspace') {
        e.preventDefault();
        string = string.substring(0, string.length - 1);
        input.value = string || "0";
    }
    
    // Escape for clear
    if (key === 'Escape') {
        string = "";
        input.value = "0";
    }
});

// Add visual feedback on input focus
input.addEventListener('focus', () => {
    input.style.boxShadow = 'inset 0px 3px 15px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(251, 124, 20, 0.3)';
});

input.addEventListener('blur', () => {
    input.style.boxShadow = 'inset 0px 3px 15px rgba(0, 0, 0, 0.3)';
});

// Initialize display
window.addEventListener('load', () => {
    input.value = "0";
});