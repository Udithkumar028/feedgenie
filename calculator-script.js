class Calculator {
    constructor() {
        this.previousDisplay = document.getElementById('previousDisplay');
        this.currentDisplay = document.getElementById('currentDisplay');
        this.themeBtn = document.getElementById('themeBtn');
        
        this.previousValue = '';
        this.currentValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;

        this.initializeEventListeners();
        this.loadTheme();
    }

    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(btn => {
            btn.addEventListener('click', () => this.handleNumberInput(btn.dataset.number));
        });

        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', () => this.handleOperator(btn.dataset.operator));
        });

        // Function buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
        });

        // Theme toggle
        this.themeBtn.addEventListener('click', () => this.toggleTheme());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleNumberInput(number) {
        if (number === '.' && this.currentValue.includes('.')) return;

        if (this.shouldResetDisplay) {
            this.currentValue = '';
            this.shouldResetDisplay = false;
        }

        this.currentValue += number;
        this.updateDisplay();
    }

    handleOperator(operator) {
        if (this.currentValue === '') return;

        if (this.previousValue !== '') {
            this.calculate();
        }

        this.previousValue = this.currentValue;
        this.currentValue = '';
        this.operation = operator;
        this.updateDisplay();
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'percent':
                this.percent();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }

    calculate() {
        if (this.previousValue === '' || this.currentValue === '' || !this.operation) return;

        let result;
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentValue = 'Error';
                    this.previousValue = '';
                    this.operation = null;
                    this.updateDisplay();
                    this.shouldResetDisplay = true;
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        this.currentValue = this.formatResult(result);
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    clear() {
        this.previousValue = '';
        this.currentValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }

    delete() {
        this.currentValue = this.currentValue.toString().slice(0, -1);
        this.updateDisplay();
    }

    percent() {
        if (this.currentValue === '') return;

        const current = parseFloat(this.currentValue);
        this.currentValue = this.formatResult(current / 100);
        this.updateDisplay();
    }

    formatResult(result) {
        const rounded = Math.round(result * 100000000) / 100000000;
        return rounded.toString();
    }

    updateDisplay() {
        this.currentDisplay.textContent = this.currentValue || '0';
        
        if (this.operation) {
            this.previousDisplay.textContent = `${this.previousValue} ${this.operation}`;
        } else {
            this.previousDisplay.textContent = '';
        }
    }

    handleKeyboard(e) {
        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            this.handleNumberInput(e.key);
        }

        // Decimal point
        if (e.key === '.') {
            e.preventDefault();
            this.handleNumberInput('.');
        }

        // Operators
        if (e.key === '+' || e.key === '-') {
            e.preventDefault();
            this.handleOperator(e.key);
        }

        if (e.key === '*') {
            e.preventDefault();
            this.handleOperator('*');
        }

        if (e.key === '/') {
            e.preventDefault();
            this.handleOperator('/');
        }

        // Enter or equals
        if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.calculate();
        }

        // Backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            this.delete();
        }

        // Escape for clear
        if (e.key === 'Escape') {
            e.preventDefault();
            this.clear();
        }

        // Percentage
        if (e.key === '%') {
            e.preventDefault();
            this.percent();
        }
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('light-mode');
        this.themeBtn.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            this.themeBtn.classList.add('dark');
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Add visual feedback for button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.98)';
    });

    button.addEventListener('mouseup', function() {
        this.style.transform = '';
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Prevent context menu on buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});
