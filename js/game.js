class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.currentLevel = 1;
        this.totalLevels = 4;
        
        this.coopSystem = new CooperativeSystem();
        
        this.player1 = null;
        this.player2 = null;
        
        this.isRunning = false;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupControls();
        this.setupMenu();
        
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const gameScreen = document.getElementById('game-screen');
        const header = document.getElementById('game-header');
        const controls = document.getElementById('controls-container');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - (header?.offsetHeight || 50) - (controls?.offsetHeight || 200);
    }

    setupMenu() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('replay-btn').addEventListener('click', () => this.startGame());
    }

    setupControls() {
        const setupPlayerControls = (containerId, player) => {
            const container = document.getElementById(containerId);
            
            container.querySelectorAll('.ctrl-btn').forEach(btn => {
                const action = btn.dataset.action;
                
                // Touch events
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleInput(player, action, true);
                });
                
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.handleInput(player, action, false);
                });
                
                // Mouse events para testing en desktop
                btn.addEventListener('mousedown', (e) => {
                    this.handleInput(player, action, true);
                });
                
                btn.addEventListener('mouseup', (e) => {
                    this.handleInput(player, action, false);
                });
            });
        };

        setupPlayerControls('controls-p1', 1);
        setupPlayerControls('controls-p2', 2);
    }

    handleInput(playerId, action, isPressed) {
        const player = playerId === 1 ? this.player1 : this.player2;
        if (!player || !this.isRunning) return;

        if (isPressed) {
            switch(action) {
                case 'left':
                    player.moveLeft();
                    break;
                case 'right':
                    player.moveRight();
                    break;
                case 'up':
                    player.jump();
                    break;
                case 'down':
                    // Agacharse o interactuar
                    break;
                case 'action':
                    player.action();
                    break;
            }
        }
    }

    startGame() {
        this.showScreen('game-screen');
        this.currentLevel = 1;
        this.coopSystem.reset();
        this.loadLevel(this.currentLevel);
        this.isRunning = true;
        this.gameLoop();
    }

    loadLevel(levelNum) {
        const level = LEVELS[levelNum];
        if (!level) {
            this.victory();
            return;
        }

        document.getElementById('level-indicator').textContent = `Fase ${levelNum}: ${level.name}`;
        
        // Inicializar nivel
        level.init(this.canvas.width, this.canvas.height);
        this.currentLevelData = level;
        
        // Crear jugadores
        const groundY = this.canvas.height - 50;
        this.player1 = new Player(1, 50, groundY - 60, '#4a90d9');
        this.player2 = new Player(2, this.canvas.width - 90, groundY - 60, '#d94a4a');
        
        this.showMessage(level.description);
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (!this.currentLevelData) return;

        const platforms = this.currentLevelData.platforms || [];
        
        this.player1.update(platforms, this.player2);
        this.player2.update(platforms, this.player1);
        
        // Aplicar bonus de cooperación
        const bonus = this.coopSystem.getSpeedBonus();
        this.player1.speed = 5 * bonus;
        this.player2.speed = 5 * bonus;
        
        this.currentLevelData.update(this.player1, this.player2, this);
        this.coopSystem.update();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.currentLevelData) {
            // Dibujar nivel (vista mezclada para multijugador local)
            if (this.currentLevelData.draw.length > 3) {
                // Nivel con vista específica por jugador
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.rect(0, 0, this.canvas.width/2, this.canvas.height);
                this.ctx.clip();
                this.currentLevelData.draw(this.ctx, this.canvas.width, this.canvas.height, 1);
                this.ctx.restore();
                
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.rect(this.canvas.width/2, 0, this.canvas.width/2, this.canvas.height);
                this.ctx.clip();
                this.currentLevelData.draw(this.ctx, this.canvas.width, this.canvas.height, 2);
                this.ctx.restore();
                
                // Línea divisoria
                this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(this.canvas.width/2, 0);
                this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
                this.ctx.stroke();
            } else {
                this.currentLevelData.draw(this.ctx, this.canvas.width, this.canvas.height);
            }
        }
        
        // Dibujar jugadores
        if (this.player1) this.player1.draw(this.ctx);
        if (this.player2) this.player2.draw(this.ctx);
        
        // Dibujar mensajes de cooperación
        this.coopSystem.draw(this.ctx, this.canvas.width);
    }

    addCooperation(amount) {
        this.coopSystem.addCooperation(amount);
    }

    showMessage(text) {
        this.coopSystem.showMessage(text);
    }

    completeLevel() {
        this.showMessage(`¡Fase ${this.currentLevel} completada!`);
        this.addCooperation(30);
        
        setTimeout(() => {
            this.currentLevel++;
            if (this.currentLevel > this.totalLevels) {
                this.victory();
            } else {
                this.loadLevel(this.currentLevel);
            }
        }, 2000);
    }

    victory() {
        this.isRunning = false;
        
        const stats = document.getElementById('final-stats');
        stats.innerHTML = `
            <p>Nivel de cooperación final: ${Math.round(this.coopSystem.cooperationLevel)}%</p>
            <p>Fases completadas: ${this.totalLevels}</p>
            <p>🏆 ¡Excelente trabajo en equipo!</p>
        `;
        
        this.showScreen('victory-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        if (screenId === 'game-screen') {
            setTimeout(() => this.setupCanvas(), 100);
        }
    }
}

// Iniciar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    let peer = new Peer(); 
let conn;
let miRol = 'p1'; // Por defecto eres P1

// 1. Crear la sala y generar ID
peer.on('open', (id) => {
    const shareId = prompt("Tu ID de juego es este. Pásalo a tu amigo:", id);
    // Si el usuario introduce un ID, es porque quiere UNIRSE a alguien
    if (shareId && shareId !== id) {
        conectarAAmigo(shareId);
    }
});

// 2. Esperar a que el amigo se conecte (Si eres el Host)
peer.on('connection', (connection) => {
    conn = connection;
    miRol = 'p1';
    configurarEventos();
});

// 3. Función para unirse a una partida existente
function conectarAAmigo(idAmigo) {
    conn = peer.connect(idAmigo);
    miRol = 'p2'; // El que se une es P2
    configurarEventos();
}

function configurarEventos() {
    conn.on('data', (data) => {
        // Recibimos la posición del otro jugador
        if (miRol === 'p1') {
            // Si soy P1, muevo al P2 con lo que llega
            jugador2.x = data.x;
            jugador2.y = data.y;
            jugador2.accion = data.accion;
        } else {
            // Si soy P2, muevo al P1
            jugador1.x = data.x;
            jugador1.y = data.y;
            jugador1.accion = data.accion;
        }
    });
}

// 4. Enviar tus datos en cada frame (Añade esto dentro de tu update/gameLoop)
function enviarDatos() {
    if (conn && conn.open) {
        let yo = (miRol === 'p1') ? jugador1 : jugador2;
        conn.send({
            x: yo.x,
            y: yo.y,
            accion: yo.accion
        });
    }
}

// Llama a enviarDatos() dentro de tu función que actualiza el juego (requestAnimationFrame)
});
