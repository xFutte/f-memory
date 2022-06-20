import { Difficulty } from './enum/DifficultyEnum';
import { GameStatusEnum } from './enum/GameStatus';
import { LevelEnum } from './enum/LevelEnum';

const audioDelay: number = 600;
let pattern: Array<number> = [];
let currentLevel: number = 1;
let blocks: NodeListOf<HTMLDivElement>;

let block1: HTMLDivElement;
let block2: HTMLDivElement;
let block3: HTMLDivElement;
let block4: HTMLDivElement;
let container: HTMLDivElement;

let patternInterval: number = 800;

// Audio stuff
let success_data_buffers: ArrayBuffer[] = [];
let success_audio_buffers: AudioBuffer[] = [];
let fail_data_buffers: ArrayBuffer[] = [];
let fail_audio_buffers: AudioBuffer[] = [];

const successAudioContext: AudioContext = new window.AudioContext();
const failAudioContext: AudioContext = new window.AudioContext();

const success_audio_urls: Array<string> = [
	'sound/1.mp3',
	'sound/3.mp3',
	'sound/5.mp3',
	'sound/8.mp3',
];

const fail_audio_urls: Array<string> = [
	'sound/1.mp3',
	'sound/4.mp3',
	'sound/9.mp3',
	'sound/14.mp3',
];

async function setupGame(): Promise<void> {
	blocks = document.querySelectorAll('.block');
	container = document.querySelector('.container');

	block1 = blocks[0];
	block2 = blocks[1];
	block3 = blocks[2];
	block4 = blocks[3];

	// Success audio
	success_data_buffers = await Promise.all(
		success_audio_urls.map((url) =>
			fetch(url).then((res) => res.arrayBuffer())
		)
	);
	success_audio_buffers = await Promise.all(
		success_data_buffers.map((buffer: ArrayBuffer) =>
			successAudioContext.decodeAudioData(buffer)
		)
	);

	// Fail audio
	fail_data_buffers = await Promise.all(
		fail_audio_urls.map((url) =>
			fetch(url).then((res) => res.arrayBuffer())
		)
	);
	fail_audio_buffers = await Promise.all(
		fail_data_buffers.map((buffer: ArrayBuffer) =>
			failAudioContext.decodeAudioData(buffer)
		)
	);

	if (blocks) {
		blocks.forEach((blockElement: HTMLDivElement, index: number) => {
			blockElement.addEventListener('click', () => {
				playSingleAudioNode(index);
				blockClicked(blockElement);
			});
		});
	}
}

window.addEventListener('message', (event) => {
	console.error(event.origin)

	const message = event.data;

	if (message.open === GameStatusEnum.Open) {
		initiateGame(currentLevel);
	}
});

setupGame();

function playSingleAudioNode(index: number) {
	const source: AudioBufferSourceNode =
		successAudioContext.createBufferSource();
	source.buffer = success_audio_buffers[index];
	source.connect(successAudioContext.destination);
	source.start();
}

function levelSuccessAudio(): void {
	success_audio_buffers.forEach((buffer: AudioBuffer) => {
		playAllNotes(buffer);
	});
}

function blockClicked(block: HTMLDivElement): void {
	const blockId = block.getAttribute('data-block');

	if (pattern.length && Number(blockId) === pattern[0]) {
		pattern.shift();

		if (pattern.length == 0) {
			levelSuccess();
		}
	} else {
		gameFailed();
	}
}

function levelSuccess(): void {
	setTimeout(() => {
		highlightBlocks();

		if (currentLevel !== LevelEnum.Fifth) {
			levelSuccessAudio();
			currentLevel++;

			setTimeout(() => {
				initiateGame(currentLevel);
			}, 1000);
		} else {
			gameSuccess();

			levelSuccessAudio();
			setTimeout(() => {
				levelSuccessAudio();
			}, 300);
		}
	}, audioDelay);
}

function resetGame(): void {
	pattern = [];
}

function gameSuccess(): void {
	resetGame();
	console.log('Some success audio');
}

function gameFailed(): void {
	closeGame();
	resetGame();
	playGameFailedAudio();
}

/** Plays sound when game fails */
function playGameFailedAudio(): void {
	fail_audio_buffers.forEach((buffer: AudioBuffer) => {
		playAllNotes(buffer);
	});
}

/** Play all notes in the audioContext */
function playAllNotes(buffer: AudioBuffer): void {
	const source: AudioBufferSourceNode =
		successAudioContext.createBufferSource();

	source.buffer = buffer;
	source.connect(successAudioContext.destination);
	source.start();
}

/** Play the pattern of the generate level with notes and highlights */
function playLevelPattern(): void {
	pattern.forEach((note: number, index: number) => {
		setTimeout(() => {
			playSingleAudioNode(note - 1);
			toggleSingleBlock(note);

			setTimeout(() => {
				toggleSingleBlock(note);
			}, (index * patternInterval) / 2);
		}, index * patternInterval);
	});
}

/** Make the blocks turn on and off */
function highlightBlocks(): void {
	turnOnAllBlocks();
	setTimeout(() => {
		turnOffAllBlocks();
	}, 10);
}

/** Highlight all blocks  */
function turnOnAllBlocks(): void {
	blocks.forEach((block: HTMLDivElement) => {
		block.classList.add('active');
	});
}

/** Turn off all highlighting off all blocks */
function turnOffAllBlocks(): void {
	blocks.forEach((block: HTMLDivElement) => {
		block.classList.toggle('active');
	});
}

/** Highlight a single block */
function toggleSingleBlock(block: number): void {
	// Highlighting this way is done for performance sake
	switch (block) {
		case 1:
			block1.classList.toggle('active');
			break;
		case 2:
			block2.classList.toggle('active');
			break;
		case 3:
			block3.classList.toggle('active');
			break;
		case 4:
			block4.classList.toggle('active');
			break;
	}
}

/** Show the game and setup the level */
function initiateGame(level: LevelEnum): void {
	container.classList.remove('hidden');
	pattern = [];
	setupLevel(level);
}

/** Hide the game and reset the game pattern */
function closeGame(): void {
	container.classList.add('hidden');
	// TODO SEND HTTP REQUEST TO CLIENT:LUA
}

/**
 * Setup the next level that should be generated and updates the pattern
 *
 * @param {LevelEnum} level
 * @returns {number}
 */
function setupLevel(level: LevelEnum): void {
	let patternLength: number;

	switch (level) {
		case LevelEnum.First:
			patternLength = Difficulty.Four;
			break;
		case LevelEnum.Second:
			patternLength = Difficulty.Five;
			break;
		case LevelEnum.Third:
			patternLength = Difficulty.Six;
			break;
		case LevelEnum.Fourth:
			patternLength = Difficulty.Seven;
			break;
		case LevelEnum.Fifth:
			patternLength = Difficulty.Eight;
			break;
	}

	for (let index = 0; index < patternLength; index++) {
		pattern.push(randomNumber(1, 4));
	}

	console.log(pattern);
	setTimeout(() => {
		playLevelPattern();
	}, 1000);
}

function randomNumber(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startCountdown(level: LevelEnum): void {}

function allowUserInput() {
	throw new Error('Function not implemented.');
}
