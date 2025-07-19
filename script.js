const URL = "./my-pose-model/"; // make sure your folder is named exactly "my-pose-model"
let model, webcam, ctx, labelContainer, maxPredictions;

let fallStartTime = null;
let fallAlerted = false;
let isMonitoring = false;

// Constants for fall detection
const FALL_CLASS_NAME = "Falling";
const FALL_WINDOW_SIZE = 5;
const MIN_FALL_FRAMES = 3;
const FALL_THRESHOLD = 0.5;
const FALL_DURATION = 3000;
const fallDetectionWindow = [];

// Constants for pose detection
const POSE_KEYPOINTS = {
    NOSE: 0,
    HIP: 11,
    KNEE: 13,
    ANKLE: 15
};
const VERTICAL_THRESHOLD = 0.3;
const MIN_POSE_CONFIDENCE = 0.5;
let lastHeadPosition = null;
let verticalChangeWindow = [];
const VERTICAL_WINDOW_SIZE = 5;

// Main functions
async function init() {
    // ...existing init code...
}

async function loop(timestamp) {
    // ...existing loop code...
}

async function predict() {
    // ...existing predict code...
}

// Helper functions
function drawPose(pose) {
    // ...existing drawPose code...
}

function checkAbnormalPose(keypoints) {
    // ...existing checkAbnormalPose code...
}

function updateStatusDisplay(isFallDetected) {
    // ...existing updateStatusDisplay code...
}

function triggerEmergency() {
    // ...existing triggerEmergency code...
}

function logAlert(message) {
    // ...existing logAlert code...
}

function playAlertSound() {
    // ...existing playAlertSound code...
}

function stopMonitoring() {
    // ...existing stopMonitoring code...
}

// Event listeners
window.addEventListener('resize', () => {
    // ...existing resize handler code...
});