// ========== UI要素の取得 ==========
const canvas = document.getElementById('gameCanvas');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartMessage = document.getElementById('restartMessage');
const twitterShareButton = document.getElementById('twitter-share');
const lineShareButton = document.getElementById('line-share');
const friendShareButton = document.getElementById('friend-share-button');

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ========== ゲームの変数 ==========
let score = 0;
let gameOver = false;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: 'orange',
};

const mouse = { x: player.x, y: player.y };

// ========== イベントリスナー ==========
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// ▼▼▼【ここから追加】スマホのタッチ操作に対応 ▼▼▼
window.addEventListener('touchmove', (event) => {
    // 画面のスクロールなど、ブラウザのデフォルトの動きを防止
    event.preventDefault();
    if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
}, { passive: false });

window.addEventListener('touchstart', (event) => {
    if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
});
// ▲▲▲【ここまで追加】▲▲▲

// リスタート処理
restartMessage.addEventListener('click', () => document.location.reload());

// ========== 共有機能 ==========
const GAME_URL = "https://www.rikkiblog.net/entry/micro_cosmos";
const GAME_TITLE = "ミクロコスモス・サバイバー";
const HASH_TAGS = "ブラウザゲーム,ミクロコスモスサバイバー";

// スコアをX(Twitter)でシェア
twitterShareButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = `スコア${score}点でした！みんなも遊んでみよう！\n\n${GAME_TITLE}\n`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(GAME_URL)}&hashtags=${encodeURIComponent(HASH_TAGS)}`;
    window.open(shareUrl, '_blank');
});

// スコアをLINEでシェア
lineShareButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = `「${GAME_TITLE}」でスコア${score}点でした！あなたも挑戦してみて！`;
    const shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}%0D%0A${encodeURIComponent(GAME_URL)}`;
    window.open(shareUrl, '_blank');
});

// 友達にゲームを教える
friendShareButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = `面白いブラウザゲーム見つけたよ！一緒に遊ぼう！\n\n${GAME_TITLE}\n`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(GAME_URL)}&hashtags=${encodeURIComponent(HASH_TAGS)}`;
    window.open(shareUrl, '_blank');
});


// ========== ゲームの要素（パーティクルと敵）の準備 ==========
const particles = [];
const particleCount = 200;
const colors = ['#2ecc71', '#3498db', '#e74c3c', '#f1c40f', '#9b59b6'];
for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        radius: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)]
    });
}

const enemies = [];
const enemyCount = 5;
for (let i = 0; i < enemyCount; i++) {
    let enemyX, enemyY;
    do {
        enemyX = Math.random() * canvas.width;
        enemyY = Math.random() * canvas.height;
    } while (Math.hypot(enemyX - player.x, enemyY - player.y) < 200);
    enemies.push({
        x: enemyX, y: enemyY, radius: Math.random() * 20 + 10, color: 'rgba(255, 0, 0, 0.7)',
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2
    });
}


// ========== ゲームのメインループ ==========
function gameLoop() {
    if (gameOver) return; // ゲームオーバーなら以降の処理をしない

    // プレイヤーの移動と画面のクリア
    player.x += (mouse.x - player.x) * 0.05;
    player.y += (mouse.y - player.y) * 0.05;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // エサの処理
    particles.forEach(p => {
        if (Math.hypot(player.x - p.x, player.y - p.y) < player.radius + p.radius) {
            player.radius += 0.2;
            score += 10;
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    });

    // 敵の処理
    enemies.forEach(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        if (enemy.x < enemy.radius || enemy.x > canvas.width - enemy.radius) enemy.vx *= -1;
        if (enemy.y < enemy.radius || enemy.y > canvas.height - enemy.radius) enemy.vy *= -1;

        particles.forEach(p => {
            if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < enemy.radius + p.radius) {
                enemy.radius += 0.1;
                p.x = Math.random() * canvas.width;
                p.y = Math.random() * canvas.height;
            }
        });
        
        if (Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.radius + enemy.radius) {
            gameOver = true;
            // ゲームオーバー画面を表示する
            finalScoreElement.textContent = score;
            gameOverScreen.style.display = 'flex';
        }
        
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
    });

    // プレイヤーとスコアの描画
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 40);

    requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();
