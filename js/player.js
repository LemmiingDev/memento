class Player {
    constructor(id, x, y, color) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 50;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.isGrounded = false;
        this.isActioning = false;
        this.hasItem = null;
        this.facingRight = id === 1;
        
        // Estados de animación
        this.frame = 0;
        this.animationTimer = 0;
    }

    update(platforms, otherPlayer) {
        // Gravedad
        this.velocityY += 0.5;
        
        // Aplicar movimiento
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Fricción
        this.velocityX *= 0.8;
        
        // Colisión con plataformas
        this.isGrounded = false;
        platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                if (this.velocityY > 0 && this.y + this.height - this.velocityY <= platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.isGrounded = true;
                }
            }
        });
        
        // Límites de pantalla
        const canvasWidth = document.getElementById('game-canvas').width;
        const canvasHeight = document.getElementById('game-canvas').height;
        
        // Cada jugador en su mitad
        if (this.id === 1) {
            this.x = Math.max(0, Math.min(this.x, canvasWidth / 2 - this.width));
        } else {
            this.x = Math.max(canvasWidth / 2, Math.min(this.x, canvasWidth - this.width));
        }
        
        // Suelo
        if (this.y + this.height > canvasHeight - 50) {
            this.y = canvasHeight - 50 - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
        }
        
        // Animación
        this.animationTimer++;
        if (this.animationTimer > 10) {
            this.frame = (this.frame + 1) % 4;
            this.animationTimer = 0;
        }
    }

    moveLeft() {
        this.velocityX = -this.speed;
        this.facingRight = false;
    }

    moveRight() {
        this.velocityX = this.speed;
        this.facingRight = true;
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = -12;
            this.isGrounded = false;
        }
    }

    action() {
        this.isActioning = true;
        setTimeout(() => this.isActioning = false, 300);
    }

    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }

    draw(ctx) {
        ctx.save();
        
        // Cuerpo del personaje
        const bodyColor = this.id === 1 ? '#4a90d9' : '#d94a4a';
        const skinColor = '#ffcc99';
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height + 5, this.width/2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Piernas (animación simple)
        ctx.fillStyle = '#5c4033';
        const legOffset = Math.sin(this.frame * Math.PI / 2) * 5;
        ctx.fillRect(this.x + 8, this.y + 35, 10, 15 + legOffset);
        ctx.fillRect(this.x + 22, this.y + 35, 10, 15 - legOffset);
        
        // Cuerpo
        ctx.fillStyle = bodyColor;
        ctx.fillRect(this.x + 5, this.y + 15, 30, 25);
        
        // Cabeza
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 12, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Sombrero de explorador
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + 5, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(this.x + 12, this.y - 5, 16, 10);
        
        // Ojos
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 10, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 25, this.y + 10, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        const eyeOffset = this.facingRight ? 1 : -1;
        ctx.beginPath();
        ctx.arc(this.x + 15 + eyeOffset, this.y + 10, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 25 + eyeOffset, this.y + 10, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Indicador de acción
        if (this.isActioning) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 30, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Item en mano
        if (this.hasItem) {
            ctx.fillStyle = this.hasItem.color;
            ctx.fillRect(this.x + (this.facingRight ? 35 : -10), this.y + 20, 15, 15);
        }
        
        // Número de jugador
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`P${this.id}`, this.x + this.width/2, this.y - 10);
        
        ctx.restore();
    }
}
