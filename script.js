let level = 0;
let totalAttempts = 0;

// 단계별 성공 확률
const enhanceRates = [0.4, 0.35, 0.2, 0.18, 0.15, 0.1];
// const enhanceRates = [1, 1, 1, 1, 1, 1];

const goldCosts = [1000000, 2000000, 4000000, 8000000, 16000000, 32000000];
const itemCosts = [1, 5, 10, 15, 20, 25];
function toRoman(num) {
	const roman = ['', 'I', 'II', 'III', 'IV', 'V'];
	return roman[num] || num;
}

let totalGoldUsed = 0;
let totalItemsUsed = 0;

let lastEnhanceMode = "manual"; // "manual" | "repeat" | "simulate"
let totalReturnedItems = 0;


// 단계별 성공/실패 이미지
const stepImages = [
	{
		success: "image/success/01.gif",
		fail: "image/fail/01.gif"
	},
	{
		success: "image/success/02.gif",
		fail: "image/fail/02.gif"
	},
	{
		success: "image/success/03.gif",
		fail: "image/fail/03.gif"
	},
	{
		success: "image/success/04.gif",
		fail: "image/fail/04.gif"
	},
	{
		success: "image/success/05.gif",
		fail: "image/fail/05.gif"
	},
	{
		success: "image/success/06.gif",
		fail: "image/fail/06.gif"
	}
];

const stats = enhanceRates.map(() => ({ success: 0, fail: 0 }));

function getTargetLevel() {
    // select의 value는 1~6, 내부 배열 인덱스는 0~5
    return parseInt(document.getElementById("targetLevel").value, 10);
}

function tryEnhance() {
	if (lastEnhanceMode !== "manual") {
		resetEnhanceState({ resetLog: true, resetStatsData: true, resetLevel: true }); // ✅ 강화단계까지 초기화
	}

	lastEnhanceMode = "manual";

	const maxLevel = enhanceRates.length;
	if (level >= maxLevel) {
		logMessage("최대 오버클럭 단계입니다!");
		return;
	}

	totalAttempts++;
	document.getElementById("totalAttempts").innerText = `총 오버클럭 시도: ${totalAttempts}회`;

	// 소모 비용 계산
	const goldUsed = goldCosts[level];
	const itemsUsed = itemCosts[level];
	totalGoldUsed += goldUsed;
	totalItemsUsed += itemsUsed;

	// UI 업데이트
	document.getElementById("usedGold").innerText = `누적 사용 제니: ${totalGoldUsed.toLocaleString()}`;
	document.getElementById("usedItems").innerText = `누적 사용 정수: ${totalItemsUsed}개`;

	const successRate = enhanceRates[level];
	const roll = getSecureRandom();

	if (roll < successRate) {
		stats[level].success++;
		showImage(stepImages[level].success);
		level++;

		if (level !== 1) {
			logMessage(`성공! 오버클럭 단계가 ${toRoman(level-1)}로 상승했습니다!`);
		}
		else {
			logMessage(`성공! 오버클럭 상태가 되었습니다!`);
		}
	} else {
		stats[level].fail++;
		showImage(stepImages[level].fail);
		const failRewards = [1, 3, 5, 16, 40, 100];
        const reward = failRewards[level];
		console.log(failRewards[level], level)
        totalReturnedItems += reward;
		logMessage(`실패... 오버클럭 단계가 초기화되었습니다.`);

		level = 0;
	}

	if (level == 0)
	{
		document.getElementById("level").innerText = `현재 오버클럭 단계: 9강`;
	}
	else
	{
		document.getElementById("level").innerText = `현재 오버클럭 단계: ${toRoman(level-1)}`;		
	}
	updateStatsTable();
	updateNextCost();
	updateSuccessRate();

	document.getElementById("returnedItems").innerText = `녹아버린 검신: ${totalReturnedItems}개`;
}

function getSecureRandom() {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / (0xFFFFFFFF + 1);
}

function logMessage(msg) {
	const log = document.getElementById("log");
	const time = new Date().toLocaleTimeString();
	log.innerHTML = `[${time}] ${msg}<br>` + log.innerHTML;
}

function showImage(src) {
	const img = document.getElementById("gif");
	img.src = src;
	img.style.display = "block";
}

function updateStatsTable() {
	const tbody = document.querySelector("#statsTable tbody");
	tbody.innerHTML = "";

	stats.forEach((entry, idx) => {
		const total = entry.success + entry.fail;
		const expectedRate = enhanceRates[idx] * 100;
		const actualRate = total > 0 ? (entry.success / total) * 100 : 0;
		const error = (actualRate - expectedRate).toFixed(2);

		const tr = document.createElement("tr");
		tr.innerHTML = `
      <td>${toRoman(idx)}</td>
      <td>${entry.success}</td>
      <td>${entry.fail}</td>
      <td>${expectedRate.toFixed(2)}%</td>
      <td>${actualRate.toFixed(2)}%</td>
      <td>${error > 0 ? "+" : ""}${error}%</td>
    `;
		tbody.appendChild(tr);
	});
}

updateStatsTable();

function updateNextCost() {
	if (level >= enhanceRates.length) {
		document.getElementById("nextCost").innerText = "오버클럭 완료";
	} else {
		const gold = goldCosts[level].toLocaleString();
		const item = itemCosts[level];
		document.getElementById("nextCost").innerText = `다음 단계 오버클럭 비용: ${gold} / ${item}개`;
	}
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function updateSuccessRate() {
	if (level >= enhanceRates.length) {
		document.getElementById("successRate").innerText = "성공 확률: 없음 (최대 오버클럭)";
	} else {
		const percent = Math.round(enhanceRates[level] * 100);
		document.getElementById("successRate").innerText = `📈 현재 단계 성공 확률: ${percent}%`;
	}
}

function showProbabilityTable() {
	const tbody = document.getElementById("probabilityBody");
	tbody.innerHTML = ""; // 초기화

	for (let i = 0; i < enhanceRates.length; i++) {
		const tr = document.createElement("tr");
		tr.innerHTML = `
		<td>${toRoman(i)}</td>
      <td>${Math.round(enhanceRates[i] * 100)}%</td>
      <td>${goldCosts[i].toLocaleString()} G</td>
      <td>${itemCosts[i]}개</td>
    `;
		tbody.appendChild(tr);
	}

	document.getElementById("probabilityModal").style.display = "block";
}

function hideProbabilityTable() {
	document.getElementById("probabilityModal").style.display = "none";
}

function simulateUntilMax() {
	resetEnhanceState();
	lastEnhanceMode = "simulate";

	let simLevel = 0;
	let simAttempts = 0;
	let simGold = 0;
	let simItems = 0;
	const simStats = [0, 0, 0, 0, 0, 0]; // 각 단계별 성공 횟수

	const simSuccessStats = [0, 0, 0, 0, 0, 0];
	const simFailStats = [0, 0, 0, 0, 0, 0];

	const failRewards = [1, 3, 5, 16, 40, 100]; // 단계별 실패 보상

    let simReturnedItems = 0;

	const target = getTargetLevel();

	while (simLevel < target) {
		const rate = enhanceRates[simLevel];
		const roll = getSecureRandom();

		simAttempts++;
		simGold += goldCosts[simLevel];
		simItems += itemCosts[simLevel];

		if (roll < rate) {
			simStats[simLevel]++;
			simSuccessStats[simLevel]++;
			simLevel++;
		} else {
			simFailStats[simLevel]++;
			simReturnedItems += failRewards[simLevel];
			simLevel = 0; // 실패하면 초기화
		}
	}

	for (let i = 0; i < stats.length; i++) {
		stats[i].success += simSuccessStats[i];
		stats[i].fail += simFailStats[i];
	}

	updateStatsTable();

	// 실제 게임 상태에도 반영
	level = enhanceRates.length;
	totalAttempts += simAttempts;
	totalGoldUsed += simGold;
	totalItemsUsed += simItems;
	totalReturnedItems += simReturnedItems;

	document.getElementById("level").innerText = `현재 오버클럭 단계: ${toRoman(target-1)}`;
	document.getElementById("totalAttempts").innerText = `총 오버클럭 시도: ${totalAttempts}회`;
	document.getElementById("usedGold").innerText = `누적 사용 제니: ${totalGoldUsed.toLocaleString()}`;
	document.getElementById("usedItems").innerText = `누적 사용 정수: ${totalItemsUsed}개`;
	document.getElementById("returnedItems").innerText = `녹아버린 검신: ${totalReturnedItems}개`;
	updateNextCost();
	updateSuccessRate();

	// 결과 로그 한 번에 출력
	logMessage(`🎯 시뮬레이션 결과: ${toRoman(target-1)} 도달!`);
	logMessage(`🔁 총 시도 횟수: ${simAttempts}회`);
	logMessage(`💰 사용한 제니: ${simGold.toLocaleString()}`);
	logMessage(`📦 사용한 정수: ${simItems}개`);
	logMessage(`🧩 녹아버린 검신: ${simReturnedItems}개`);
	for (let i = 0; i < target; i++) {
		if (i !== 0)
		{
			logMessage(`${toRoman(i-1)} → ${toRoman(i)} : 성공 ${simSuccessStats[i]}회 / 실패 ${simFailStats[i]}회`);
		}
		else
		{
			logMessage(`9강 → ${toRoman(i)} : 성공 ${simSuccessStats[i]}회 / 실패 ${simFailStats[i]}회`);
		}
	}

	showImage(stepImages[5].success);
}

function clearLog() {
	document.getElementById("log").innerHTML = "";
}

function allReset(){
	resetStats()
	
	level = 0;
    totalAttempts = 0;
    totalGoldUsed = 0;
    totalItemsUsed = 0;

    document.getElementById('level').innerText = '현재 오버클럭 단계: 9강';
    document.getElementById('totalAttempts').innerText = '총 오버클럭 시도: 0회';
    document.getElementById('usedGold').innerText = '누적 사용 제니: 0';
    document.getElementById('usedItems').innerText = '누적 사용 정수: 0개';
	document.getElementById("returnedItems").innerText = `녹아버린 검신: 0개`;
    document.getElementById('nextCost').innerText = '다음 단계 오버클럭 비용: 1,000,000 / 1개';
    document.getElementById('successRate').innerText = '📈 현재 단계 성공 확률: 40%';

	updateNextCost();      // ← 이거 꼭 호출!
    updateSuccessRate();   // ← 이거 꼭 호출!

	clearLog();
}

function resetStats() {
	stats.forEach((entry) => {
		entry.success = 0;
		entry.fail = 0;
	});
	updateStatsTable();
}

function resetEnhanceState({ resetLog = true, resetStatsData = true, resetLevel = true } = {}) {
	if (resetLog) clearLog();
	if (resetStatsData) resetStats();
	if (resetLevel) {
		level = 0;
		document.getElementById("level").innerText = `현재 오버클럭 단계: 9강`;
		updateNextCost()
		updateSuccessRate();
	}
}

let autoEnhanceRunning = false;
let autoEnhancePaused = false;

function startAutoEnhance() {
	if (autoEnhanceRunning) return;
	autoEnhanceRunning = true;
	autoEnhancePaused = false;

	resetEnhanceState({ resetLog: true, resetStatsData: false, resetLevel: true });
	lastEnhanceMode = "repeat";

	runAutoEnhance();
}

function runAutoEnhance() {
	if (!autoEnhanceRunning || autoEnhancePaused || level >= enhanceRates.length) {
		return;
	}

	tryEnhance(); // 기존 강화 로직 사용

	setTimeout(runAutoEnhance, 300); // 300ms 간격으로 반복
}

function pauseAutoEnhance() {
	autoEnhancePaused = true;
}

function stopAutoEnhance() {
	autoEnhanceRunning = false;
	autoEnhancePaused = false;
}

function showAutoEnhanceControls() {
	document.getElementById("pauseBtn").style.display = "inline-block";
	document.getElementById("stopBtn").style.display = "inline-block";
	document.getElementById("resumeBtn").style.display = "none"; // 시작 시엔 resume 숨김
}

function hideAutoEnhanceControls() {
	document.getElementById("pauseBtn").style.display = "none";
	document.getElementById("resumeBtn").style.display = "none";
	document.getElementById("stopBtn").style.display = "none";
}

function startAutoEnhance() {
	if (autoEnhanceRunning) return;

	autoEnhanceRunning = true;
	autoEnhancePaused = false;
	lastEnhanceMode = "repeat";

	resetEnhanceState({ resetLog: true, resetStatsData: false, resetLevel: true });

	showAutoEnhanceControls(); // ✅ 버튼 표시
	runAutoEnhance();
}

function stopAutoEnhance() {
	autoEnhanceRunning = false;
	autoEnhancePaused = false;

	hideAutoEnhanceControls(); // ✅ 버튼 숨김
}

function pauseAutoEnhance() {
	autoEnhancePaused = true;
	document.getElementById("pauseBtn").style.display = "none";
	document.getElementById("resumeBtn").style.display = "inline-block";
}

function resumeAutoEnhance() {
	autoEnhancePaused = false;
	document.getElementById("resumeBtn").style.display = "none";
	document.getElementById("pauseBtn").style.display = "inline-block";
	runAutoEnhance(); // 반복 다시 시작
}

function runAutoEnhance() {
	if (!autoEnhanceRunning || autoEnhancePaused) return;

	const target = getTargetLevel();
    if (level >= target) {
        stopAutoEnhance();
        return;
    }

	tryEnhance();
	setTimeout(runAutoEnhance, 300);
}