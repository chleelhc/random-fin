// 동물 캐릭터 데이터 (10개)
const animals = [
    { emoji: '🐰', name: '토끼', color: '#FFB6C1' },
    { emoji: '🐢', name: '거북이', color: '#90EE90' },
    { emoji: '🐸', name: '개구리', color: '#98FB98' },
    { emoji: '🐱', name: '고양이', color: '#F0E68C' },
    { emoji: '🐶', name: '강아지', color: '#DEB887' },
    { emoji: '🐼', name: '판다', color: '#F5F5DC' },
    { emoji: '🐨', name: '코알라', color: '#D3D3D3' },
    { emoji: '🐯', name: '호랑이', color: '#FFA500' },
    { emoji: '🦊', name: '여우', color: '#FF6347' },
    { emoji: '🐮', name: '소', color: '#8B4513' }
];

// 게임 상태 변수
let selectedAnimals = [];
let raceInProgress = false;
let finishedAnimals = [];
let animationIds = [];

// DOM 요소들
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const replayBtn = document.getElementById('replayBtn');
const ranking = document.getElementById('ranking');
const rankingList = document.getElementById('rankingList');
const bgMusic = document.getElementById('bgMusic');

// 초기화
function init() {
    selectRandomAnimals();
    displayAnimals();
    resetGame();
}

// 랜덤하게 5마리 동물 선택
function selectRandomAnimals() {
    const shuffled = [...animals].sort(() => 0.5 - Math.random());
    selectedAnimals = shuffled.slice(0, 5);
}

// 선택된 동물들을 트랙에 표시
function displayAnimals() {
    selectedAnimals.forEach((animal, index) => {
        const animalElement = document.getElementById(`animal${index + 1}`);
        animalElement.textContent = animal.emoji;
        animalElement.style.backgroundColor = animal.color;
    });
}

// 게임 리셋
function resetGame() {
    raceInProgress = false;
    finishedAnimals = [];
    animationIds = [];
    
    // 동물들을 시작 위치로 이동
    selectedAnimals.forEach((animal, index) => {
        const animalElement = document.getElementById(`animal${index + 1}`);
        animalElement.style.left = '20px';
    });
    
    // 버튼 상태 초기화
    startBtn.disabled = false;
    stopBtn.disabled = true;
    replayBtn.style.display = 'none';
    ranking.style.display = 'none';
    
    // 음악 정지
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

// 경주 시작
function startRace() {
    if (raceInProgress) return;
    
    raceInProgress = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    // 배경음악 시작
    bgMusic.play().catch(e => console.log('음악 재생 실패:', e));
    
    // 각 동물에 대해 랜덤 속도로 경주 시작
    selectedAnimals.forEach((animal, index) => {
        const animalElement = document.getElementById(`animal${index + 1}`);
        const trackWidth = document.querySelector('.race-track').offsetWidth - 100;
        const duration = Math.random() * 2000 + 5000; // 5-7초
        
        animateAnimal(animalElement, trackWidth, duration, animal);
    });
}

// 동물 애니메이션
function animateAnimal(animalElement, distance, duration, animal) {
    const startTime = Date.now();
    const startPosition = 20;
    let finalOrderDetermined = false;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 골인 1-2초 전에 최종 순위 결정
        if (progress > 0.8 && !finalOrderDetermined) {
            finalOrderDetermined = true;
            determineFinalOrder();
        }
        
        // 부드러운 이징 함수
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentPosition = startPosition + (distance * easeProgress);
        
        animalElement.style.left = currentPosition + 'px';
        
        if (progress < 1) {
            animationIds.push(requestAnimationFrame(animate));
        } else {
            // 결승선 도착
            if (!finishedAnimals.find(finished => finished.animal === animal)) {
                finishedAnimals.push({
                    animal: animal,
                    finishTime: Date.now()
                });
            }
        }
    }
    
    animate();
}

// 골인 직전 최종 순위 결정
function determineFinalOrder() {
    // 아직 완주하지 않은 동물들만 선택
    const unfinishedAnimals = selectedAnimals.filter(animal => 
        !finishedAnimals.find(finished => finished.animal === animal)
    );
    
    if (unfinishedAnimals.length > 1) {
        // 랜덤하게 순서를 섞어서 최종 순위 결정
        const shuffled = [...unfinishedAnimals].sort(() => 0.5 - Math.random());
        
        // 각 동물의 애니메이션을 조정하여 새로운 순서로 골인
        shuffled.forEach((animal, index) => {
            const animalIndex = selectedAnimals.indexOf(animal);
            const animalElement = document.getElementById(`animal${animalIndex + 1}`);
            
            // 현재 위치에서 골인까지의 거리 계산
            const currentLeft = parseFloat(animalElement.style.left);
            const finishLine = document.querySelector('.race-track').offsetWidth - 100;
            const remainingDistance = finishLine - currentLeft;
            
            // 남은 거리를 새로운 순서에 따라 조정
            const newDuration = 1000 + (index * 200); // 1-2초 사이에 순차적으로 골인
            
            // 새로운 애니메이션 시작
            animateToFinish(animalElement, currentLeft, finishLine, newDuration, animal);
        });
    }
}

// 골인까지의 애니메이션
function animateToFinish(animalElement, startPos, endPos, duration, animal) {
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 부드러운 이징 함수
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        const currentPosition = startPos + ((endPos - startPos) * easeProgress);
        
        animalElement.style.left = currentPosition + 'px';
        
        if (progress < 1) {
            animationIds.push(requestAnimationFrame(animate));
        } else {
            // 결승선 도착
            if (!finishedAnimals.find(finished => finished.animal === animal)) {
                finishedAnimals.push({
                    animal: animal,
                    finishTime: Date.now()
                });
            }
        }
    }
    
    animate();
}

// 순위 표시 (기존 stopRace 함수)
function showRanking() {
    raceInProgress = false;
    startBtn.disabled = true;
    stopBtn.disabled = true;
    
    // 애니메이션 중지
    animationIds.forEach(id => cancelAnimationFrame(id));
    animationIds = [];
    
    // 음악 정지
    bgMusic.pause();
    
    // 순위 표시
    displayRanking();
    
    // Replay 버튼 표시
    replayBtn.style.display = 'inline-block';
}

// 순위 표시
function displayRanking() {
    // 완주하지 못한 동물들도 포함하여 순위 계산
    const allAnimals = selectedAnimals.map((animal, index) => {
        const finished = finishedAnimals.find(f => f.animal === animal);
        return {
            animal: animal,
            finished: !!finished,
            finishTime: finished ? finished.finishTime : Infinity,
            position: finished ? finishedAnimals.indexOf(finished) + 1 : 'DNF'
        };
    });
    
    // 완주한 순서대로 정렬
    allAnimals.sort((a, b) => {
        if (a.finished && b.finished) {
            return a.finishTime - b.finishTime;
        }
        if (a.finished) return -1;
        if (b.finished) return 1;
        return 0;
    });
    
    // 순위 HTML 생성
    rankingList.innerHTML = '';
    allAnimals.forEach((animalData, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        
        const rankNumber = document.createElement('div');
        rankNumber.className = 'rank-number';
        rankNumber.textContent = animalData.finished ? animalData.position : 'DNF';
        
        const animalIcon = document.createElement('div');
        animalIcon.className = 'animal-icon';
        animalIcon.textContent = animalData.animal.emoji;
        
        const animalName = document.createElement('div');
        animalName.className = 'animal-name';
        animalName.textContent = animalData.animal.name;
        
        rankingItem.appendChild(rankNumber);
        rankingItem.appendChild(animalIcon);
        rankingItem.appendChild(animalName);
        
        rankingList.appendChild(rankingItem);
    });
    
    ranking.style.display = 'block';
}

// 이벤트 리스너 등록
startBtn.addEventListener('click', startRace);
stopBtn.addEventListener('click', showRanking);
replayBtn.addEventListener('click', () => {
    init();
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', init);

// 음악 자동 재생 방지
document.addEventListener('click', function() {
    bgMusic.play().catch(e => console.log('음악 재생 실패:', e));
}, { once: true }); 