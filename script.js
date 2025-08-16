// Enhanced Calculator with Standard and Scientific Modes
class AdvancedCalculator {
    constructor() {
        this.input = document.getElementById('inputBox');
        this.calculator = document.getElementById('calculator');
        this.modeToggle = document.getElementById('modeToggle');
        this.scientificPanel = document.getElementById('scientificPanel');
        this.toggleText = document.querySelector('.toggle-text');
        this.themeToggle = document.getElementById('themeToggle');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        this.currentInput = "";
        this.isScientificMode = false;
        this.lastResult = 0;
        this.memory = 0;
        this.history = [];
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.setupKeyboardSupport();
        this.restorePreferences();
        this.updateDisplay();
        this.renderHistory();
    }
    
    attachEventListeners() {
        // Mode toggle
        this.modeToggle.addEventListener('click', () => this.toggleMode());

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
        
        // All calculator buttons
        document.querySelectorAll('.button').forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
        });
        
        // Scientific function buttons
        document.querySelectorAll('.scientific').forEach(button => {
            button.addEventListener('click', (e) => this.handleScientificFunction(e));
        });
    }
    
    setupKeyboardSupport() {
        // Only enable keyboard support on non-mobile devices
        if (!this.isMobileDevice()) {
            document.addEventListener('keydown', (e) => {
                e.preventDefault();
                
                const key = e.key;
                const keyMappings = {
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
                    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    '+': '+', '-': '-', '*': '*', '/': '/',
                    '.': '.', '%': '%',
                    'Enter': '=', '=': '=',
                    'Escape': 'AC', 'c': 'AC', 'C': 'AC',
                    'Backspace': 'DEL', 'Delete': 'DEL'
                };
                
                if (keyMappings[key]) {
                    this.simulateButtonClick(keyMappings[key]);
                }
            });
        }
        
        // Add touch support for mobile devices
        this.setupTouchSupport();
    }
    
    setupTouchSupport() {
        // Prevent zoom on double tap for iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Add haptic feedback for supported devices
        document.querySelectorAll('.button').forEach(button => {
            button.addEventListener('touchstart', () => {
                if (navigator.vibrate) {
                    navigator.vibrate(10); // Short vibration
                }
            });
        });
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('button')) {
                e.preventDefault();
            }
        });
    }
    
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }
    
    simulateButtonClick(value) {
        const button = document.querySelector(`button:not(.scientific)[innerHTML="${value}"], button.clear`);
        if (button) {
            this.addButtonAnimation(button);
            if (value === 'AC') {
                this.clear();
            } else if (value === 'DEL') {
                this.delete();
            } else if (value === '=') {
                this.calculate();
            } else {
                this.appendToInput(value);
            }
        }
    }
    
    toggleMode() {
        this.isScientificMode = !this.isScientificMode;
        
        if (this.isScientificMode) {
            this.calculator.classList.add('scientific');
            this.toggleText.textContent = 'Standard';
            
            // Ensure scientific panel is visible by scrolling if needed
            setTimeout(() => {
                this.ensureScientificPanelVisible();
            }, 300);
        } else {
            this.calculator.classList.remove('scientific');
            this.toggleText.textContent = 'Scientific';
        }
        
        // Add toggle animation
        this.modeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.modeToggle.style.transform = 'scale(1)';
        }, 150);

        // Persist mode preference
        this.persistPreferences();
    }
    
    ensureScientificPanelVisible() {
        const scientificPanel = this.scientificPanel;
        const calculator = this.calculator;
        
        // Check if scientific panel is fully visible
        const panelRect = scientificPanel.getBoundingClientRect();
        const calculatorRect = calculator.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // If the calculator extends beyond viewport, adjust body alignment
        if (calculatorRect.bottom > viewportHeight) {
            document.body.style.alignItems = 'flex-start';
            document.body.style.paddingTop = '10px';
            
            // Smooth scroll to ensure visibility
            setTimeout(() => {
                scientificPanel.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 100);
        }
    }
    
    handleButtonClick(e) {
        const button = e.target;
        const value = button.textContent;
        
        this.addButtonAnimation(button);
        
        if (value === '=') {
            this.calculate();
        } else if (value === 'AC') {
            this.clear();
        } else if (value === 'DEL') {
            this.delete();
        } else if (button.classList.contains('operator') && !['AC', 'DEL'].includes(value)) {
            this.handleOperator(value);
        } else if (button.classList.contains('number') || value === '.') {
            this.appendToInput(value);
        }
    }
    
    handleScientificFunction(e) {
        const button = e.target;
        const func = button.getAttribute('data-func');
        
        this.addButtonAnimation(button);
        this.executeScientificFunction(func);
    }
    
    executeScientificFunction(func) {
        try {
            const currentValue = parseFloat(this.currentInput) || this.lastResult || 0;
            let result;
            
            switch (func) {
                case 'sin':
                    result = Math.sin(this.toRadians(currentValue));
                    break;
                case 'cos':
                    result = Math.cos(this.toRadians(currentValue));
                    break;
                case 'tan':
                    result = Math.tan(this.toRadians(currentValue));
                    break;
                case 'log':
                    result = Math.log10(currentValue);
                    break;
                case 'ln':
                    result = Math.log(currentValue);
                    break;
                case 'sqrt':
                    result = Math.sqrt(currentValue);
                    break;
                case 'pow':
                    result = Math.pow(currentValue, 2);
                    break;
                case 'cube':
                    result = Math.pow(currentValue, 3);
                    break;
                case 'factorial':
                    result = this.factorial(currentValue);
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
                case 'exp':
                    result = Math.exp(currentValue);
                    break;
                case 'abs':
                    result = Math.abs(currentValue);
                    break;
                case 'inv':
                    result = 1 / currentValue;
                    break;
                case 'powxy':
                    this.currentInput += '^';
                    this.updateDisplay();
                    return;
                default:
                    return;
            }
            
            if (isNaN(result) || !isFinite(result)) {
                throw new Error('Invalid calculation');
            }
            
            this.currentInput = this.formatResult(result);
            this.lastResult = result;
            this.updateDisplay();
            this.addResultAnimation();

            // Log to history
            this.pushHistory({ expression: `${func}(${currentValue})`, result: this.currentInput });
            
        } catch (error) {
            this.showError();
        }
    }
    
    handleOperator(operator) {
        if (this.currentInput === "" && operator === '-') {
            this.currentInput = '-';
        } else if (this.currentInput !== "") {
            // Replace last operator if the last character is an operator
            const lastChar = this.currentInput.slice(-1);
            if (['+', '-', '*', '/', '%'].includes(lastChar)) {
                this.currentInput = this.currentInput.slice(0, -1) + operator;
            } else {
                this.currentInput += operator;
            }
        }
        this.updateDisplay();
    }
    
    appendToInput(value) {
        // Prevent multiple decimal points in the same number
        if (value === '.') {
            const parts = this.currentInput.split(/[\+\-\*\/\%]/);
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('.')) {
                return;
            }
        }
        
        this.currentInput += value;
        this.updateDisplay();
    }
    
    calculate() {
        if (this.currentInput === "") return;
        
        try {
            // Handle power operator (^)
            let expression = this.currentInput.replace(/\^/g, '**');
            
            // Enhanced eval with better error handling
            let result = Function('"use strict"; return (' + expression + ')')();
            
            if (isNaN(result) || !isFinite(result)) {
                throw new Error('Invalid calculation');
            }
            
            const formatted = this.formatResult(result);

            // Save to history before updating display
            this.pushHistory({ expression: this.currentInput, result: formatted });

            this.lastResult = result;
            this.currentInput = formatted;
            this.updateDisplay();
            this.addResultAnimation();
            
            // Add stunning calculation effect
            if (typeof addCalculationEffect === 'function') {
                addCalculationEffect();
            }
            
        } catch (error) {
            this.showError();
        }
    }
    
    clear() {
        this.currentInput = "";
        this.updateDisplay();
        this.addClearAnimation();
    }
    
    delete() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateDisplay();
    }
    
    formatResult(result) {
        // Format large numbers in scientific notation
        if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
            return result.toExponential(6);
        }
        
        // Round to avoid floating point precision issues
        return parseFloat(result.toPrecision(12)).toString();
    }
    
    updateDisplay() {
        this.input.value = this.currentInput || "0";
    }

    // === History ===
    pushHistory(entry) {
        // Keep last 20 items
        this.history.unshift({ ...entry, time: Date.now() });
        if (this.history.length > 20) this.history.pop();
        this.persistPreferences();
        this.renderHistory();
    }

    renderHistory() {
        if (!this.historyList) return;
        this.historyList.innerHTML = '';
        this.history.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <button class="history-expression" data-index="${idx}" title="Use this result">
                    <span class="exp">${this.escapeHtml(item.expression)}</span>
                    <span class="eq">=</span>
                    <span class="res">${this.escapeHtml(item.result)}</span>
                </button>
            `;
            this.historyList.appendChild(li);
        });
        // Click to reuse result
        this.historyList.querySelectorAll('.history-expression').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                const chosen = this.history[idx];
                if (chosen) {
                    this.currentInput = String(chosen.result);
                    this.updateDisplay();
                }
            });
        });
    }

    clearHistory() {
        this.history = [];
        this.persistPreferences();
        this.renderHistory();
    }

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    
    showError() {
        this.input.value = "Error";
        this.input.classList.add('error-flash');
        setTimeout(() => {
            this.input.classList.remove('error-flash');
            this.clear();
        }, 1500);
    }
    
    addButtonAnimation(button) {
        button.classList.add('button-press');
        setTimeout(() => {
            button.classList.remove('button-press');
        }, 200);
    }
    
    addResultAnimation() {
        this.input.classList.add('result-flash');
        setTimeout(() => {
            this.input.classList.remove('result-flash');
        }, 500);
    }
    
    addClearAnimation() {
        this.calculator.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.calculator.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Helper functions
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // === Theme (Day/Night) ===
    toggleTheme() {
        const willBeLight = !document.body.classList.contains('theme-light');
        document.body.classList.toggle('theme-light', willBeLight);
        document.body.classList.toggle('theme-dark', !willBeLight);
        const icon = document.querySelector('.theme-icon');
        if (icon) icon.textContent = willBeLight ? '🌙' : '☀️';
        this.persistPreferences();
    }

    applyTheme(isDark) {
        if (isDark) {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
            const icon = document.querySelector('.theme-icon');
            if (icon) icon.textContent = '☀️';
        } else {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
            const icon = document.querySelector('.theme-icon');
            if (icon) icon.textContent = '🌙';
        }
    }

    // === Persistence (localStorage) ===
    persistPreferences() {
        const data = {
            isScientificMode: this.isScientificMode,
            history: this.history,
            themeDark: document.body.classList.contains('theme-dark')
        };
        try { localStorage.setItem('advCalcPrefs', JSON.stringify(data)); } catch {}
    }

    restorePreferences() {
        try {
            const raw = localStorage.getItem('advCalcPrefs');
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data) {
                // Theme
                this.applyTheme(!!data.themeDark);
                // Mode
                if (data.isScientificMode) {
                    this.isScientificMode = true;
                    this.calculator.classList.add('scientific');
                    this.toggleText.textContent = 'Standard';
                }
                // History
                if (Array.isArray(data.history)) {
                    this.history = data.history.slice(0, 20);
                }
            }
        } catch {}
    }

    factorial(n) {
        if (n < 0 || n !== Math.floor(n)) {
            throw new Error('Invalid input for factorial');
        }
        if (n === 0 || n === 1) return 1;
        if (n > 170) throw new Error('Number too large for factorial');
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}

// Enhanced animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Initialize calculator
    const calculator = new AdvancedCalculator();
    
    // Store calculator instance globally for resize handler
    window.calculatorInstance = calculator;
    
    // Initialize stunning background animations
    initializeBackgroundAnimations();
    
    // Detect device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Add effects based on device capabilities
    if (!isMobile && !isLowEndDevice && !prefersReducedMotion) {
        // Full effects for desktop and high-end devices
        document.querySelectorAll('.button').forEach(button => {
            button.addEventListener('mouseenter', createParticleEffect);
        });
    }
    
    // Add ripple effect for all devices (lightweight)
    document.querySelectorAll('.button').forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // Add orientation change handler for mobile
    if (isMobile) {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                // Recalculate layout after orientation change
                const calculator = document.getElementById('calculator');
                calculator.style.transform = 'none';
                setTimeout(() => {
                    calculator.style.transform = '';
                }, 100);
            }, 100);
        });
    }
    
    // Add resize handler for responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const calculator = document.getElementById('calculator');
            const calculatorInstance = window.calculatorInstance;
            
            // Adjust layout based on screen size and orientation
            const isLandscape = window.innerWidth > window.innerHeight;
            const isSmallScreen = window.innerHeight < 600;
            const calculatorHeight = calculator.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            if (isSmallScreen || calculatorHeight > viewportHeight * 0.9) {
                // Small screen or calculator too tall - align to top
                document.body.style.alignItems = 'flex-start';
                document.body.style.paddingTop = isLandscape ? '5px' : '10px';
            } else {
                // Normal screen - center calculator
                document.body.style.alignItems = 'center';
                document.body.style.paddingTop = '';
            }
            
            // If in scientific mode, ensure panel remains visible
            if (calculatorInstance && calculatorInstance.isScientificMode) {
                setTimeout(() => {
                    calculatorInstance.ensureScientificPanelVisible();
                }, 100);
            }
        }, 250);
    });
});

function createParticleEffect(e) {
    const button = e.target;
    const rect = button.getBoundingClientRect();
    
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(255, 255, 255, 0.6)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 3;
        const velocity = 50;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let x = 0, y = 0, opacity = 1;
        
        const animate = () => {
            x += vx * 0.02;
            y += vy * 0.02;
            opacity -= 0.02;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(particle);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function createRippleEffect(e) {
    const button = e.target;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('div');
    
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.position = 'absolute';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.appendChild(ripple);
    
    setTimeout(() => {
        if (button.contains(ripple)) {
            button.removeChild(ripple);
        }
    }, 600);
}

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize stunning background animations
function initializeBackgroundAnimations() {
    createFloatingParticles();
    addInteractiveEffects();
    startAuroraEffect();
    optimizeForDevice();
}

// Create floating particles
function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = window.innerWidth < 768 ? 15 : 25; // Fewer particles on mobile
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random starting position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (8 + Math.random() * 4) + 's';
        
        // Random size variation
        const size = 2 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random opacity
        particle.style.opacity = 0.3 + Math.random() * 0.4;
        
        particlesContainer.appendChild(particle);
    }
}

// Add interactive effects
function addInteractiveEffects() {
    const shapes = document.querySelectorAll('.floating-shape');
    
    // Add mouse interaction for desktop
    if (!window.matchMedia('(max-width: 768px)').matches) {
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        
        // Smooth mouse following animation
        function animateShapes() {
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.02;
                const x = mouseX * speed * 30;
                const y = mouseY * speed * 30;
                
                shape.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.5}deg)`;
            });
            requestAnimationFrame(animateShapes);
        }
        animateShapes();
    }
    
    // Add calculator hover effect
    const calculator = document.getElementById('calculator');
    if (calculator) {
        calculator.addEventListener('mouseenter', () => {
            shapes.forEach(shape => {
                shape.style.opacity = '0.3';
                shape.style.transform += ' scale(1.1)';
            });
        });
        
        calculator.addEventListener('mouseleave', () => {
            shapes.forEach(shape => {
                shape.style.opacity = '0.1';
                shape.style.transform = shape.style.transform.replace(' scale(1.1)', '');
            });
        });
    }
}

// Aurora-like background effect
function startAuroraEffect() {
    const aurora = document.createElement('div');
    aurora.className = 'aurora-effect';
    aurora.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, 
            rgba(255, 107, 107, 0.08) 0%,
            rgba(78, 205, 196, 0.08) 25%,
            rgba(165, 94, 234, 0.08) 50%,
            rgba(255, 159, 243, 0.08) 75%,
            rgba(102, 126, 234, 0.08) 100%);
        background-size: 400% 400%;
        animation: auroraShift 20s ease-in-out infinite;
        pointer-events: none;
        z-index: -4;
        opacity: 0.8;
    `;
    
    document.body.appendChild(aurora);
    
    // Add aurora animation
    const auroraStyle = document.createElement('style');
    auroraStyle.textContent = `
        @keyframes auroraShift {
            0%, 100% {
                background-position: 0% 50%;
                transform: rotate(0deg) scale(1);
            }
            25% {
                background-position: 100% 50%;
                transform: rotate(1deg) scale(1.02);
            }
            50% {
                background-position: 100% 100%;
                transform: rotate(-0.5deg) scale(0.98);
            }
            75% {
                background-position: 0% 100%;
                transform: rotate(0.5deg) scale(1.01);
            }
        }
    `;
    document.head.appendChild(auroraStyle);
}

// Performance optimization for mobile devices
function optimizeForDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isMobile || isLowEndDevice || prefersReducedMotion) {
        // Reduce animation complexity
        const shapes = document.querySelectorAll('.floating-shape');
        shapes.forEach((shape, index) => {
            if (index > 4) shape.style.display = 'none'; // Hide some shapes
            shape.style.animationDuration = '30s'; // Slower animations
            shape.style.opacity = '0.05'; // More subtle
        });
        
        // Reduce particles
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            if (index > 8) particle.style.display = 'none';
            particle.style.opacity = '0.2';
        });
        
        // Reduce aurora effect
        const aurora = document.querySelector('.aurora-effect');
        if (aurora) {
            aurora.style.opacity = '0.3';
        }
    }
}

// Add pulsing effect to calculator on calculation
function addCalculationEffect() {
    const calculator = document.getElementById('calculator');
    if (calculator) {
        calculator.style.transform = 'scale(1.02)';
        calculator.style.boxShadow = '0 30px 60px rgba(102, 126, 234, 0.4)';
        
        setTimeout(() => {
            calculator.style.transform = '';
            calculator.style.boxShadow = '';
        }, 200);
    }
}