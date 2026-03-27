// 事件监听器
document.getElementById('start-game').addEventListener('click', initGame);
document.getElementById('reset-game').addEventListener('click', initGame);

// 开场动画开始游戏按钮事件
document.getElementById('intro-start-button').addEventListener('click', function() {
    const introAnimation = document.getElementById('intro-animation');
    const tutorialModal = document.getElementById('game-tutorial-modal');
    
    // 添加消失动画
    introAnimation.classList.add('fade-out');
    
    // 动画结束后隐藏开场动画，显示游戏教程
    setTimeout(() => {
        introAnimation.style.display = 'none';
        tutorialModal.style.display = 'flex';
    }, 1000);
});

// 游戏教程开始游戏按钮事件
document.getElementById('tutorial-start-game').addEventListener('click', function() {
    const tutorialModal = document.getElementById('game-tutorial-modal');
    const gameContainer = document.querySelector('.game-container');
    
    // 添加消失动画
    tutorialModal.classList.add('fade-out');
    
    // 动画结束后隐藏教程，显示游戏界面并初始化游戏
    setTimeout(() => {
        tutorialModal.style.display = 'none';
        gameContainer.style.display = 'flex';
        initGame();
    }, 1000);
});

// 播放音频的函数
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

// 初始化界面
updateUI();
