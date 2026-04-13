class CooperativeSystem {
    constructor() {
        this.cooperationLevel = 0;
        this.maxCooperation = 100;
        this.bonusActive = false;
        this.messages = [];
    }

    addCooperation(amount) {
        this.cooperationLevel = Math.max(0, Math.min(this.maxCooperation, this.cooperationLevel + amount));
        this.updateUI();
        
        if (this.cooperationLevel >= 80 && !this.bonusActive) {
            this.bonusActive = true;
            this.showMessage("¡Cooperación máxima! Velocidad aumentada");
        }
    }

    updateUI() {
        const fill = document.getElementById('coop-fill');
        if (fill) {
            fill.style.width = `${this.cooperationLevel}%`;
        }
    }

    showMessage(text) {
        this.messages.push({
            text: text,
            timer: 120,
            y: 100
        });
    }

    update() {
        this.messages = this.messages.filter(msg => {
            msg.timer--;
            msg.y -= 0.5;
            return msg.timer > 0;
        });
    }

    draw(ctx, canvasWidth) {
        this.messages.forEach(msg => {
            ctx.fillStyle = `rgba(255, 215, 0, ${msg.timer / 120})`;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(msg.text, canvasWidth / 2, msg.y);
        });
    }

    getSpeedBonus() {
        return this.bonusActive ? 1.3 : 1;
    }

    reset() {
        this.cooperationLevel = 0;
        this.bonusActive = false;
        this.messages = [];
        this.updateUI();
    }
}
