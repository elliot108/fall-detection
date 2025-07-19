const URL = "./my-pose-model/";
let model, webcam, ctx, labelContainer, maxPredictions;

let fallStartTime = null;
let fallAlerted = false;
let isMonitoring = false;

// Constants for fall detection
const FALL_CLASS_NAME = "Falling";
const FALL_THRESHOLD = 0.7;  // 70% confidence threshold
const FALL_DURATION = 3000;  // 3 seconds in milliseconds

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
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Calculate size based on container
    const container = document.querySelector('.canvas-container');
    const size = Math.min(container.offsetWidth, container.offsetHeight);
    const flip = true;
    
    webcam = new tmPose.Webcam(size, size, flip);
    await webcam.setup();
    await webcam.play();

    // Set canvas size
    const canvas = document.getElementById("canvas");
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d");

    // Initialize labels
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = '';
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    // Start monitoring
    isMonitoring = true;
    window.requestAnimationFrame(loop);

    // Enable stop button
    const stopButton = document.getElementById("stopButton");
    stopButton.classList.remove("button-disabled");
    
    // Update status
    updateStatusDisplay(false);
    logAlert("Monitoring started");
}

async function loop(timestamp) {
    if (!isMonitoring) return;
    
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// Replace the existing predict function
async function predict() {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);

    // Process predictions for fall class
    let currentFallProbability = 0;
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        if (prediction[i].className === FALL_CLASS_NAME) {
            currentFallProbability = prediction[i].probability;
            console.log(`Fall probability: ${(currentFallProbability * 100).toFixed(1)}%`);
        }
    }

    // Simple fall detection logic based on threshold
    const isFalling = currentFallProbability > FALL_THRESHOLD;

    if (isFalling) {
        if (!fallStartTime) {
            fallStartTime = Date.now();
            console.log("Starting fall timer");
        } else {
            const fallDuration = Date.now() - fallStartTime;
            console.log(`Fall duration: ${fallDuration}ms`);
            
            if (!fallAlerted && fallDuration >= FALL_DURATION) {
                fallAlerted = true;
                playAlertSound();
                logAlert("Fall detected - Emergency alert triggered");
            }
        }
    } else {
        if (fallStartTime) {
            fallStartTime = null;
            fallAlerted = false;
            console.log("Fall detection reset");
        }
    }

    updateStatusDisplay(isFalling);
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}

function updateStatusDisplay(isFalling) {
    const statusDisplay = document.getElementById('status-display');
    if (isFalling) {
        statusDisplay.innerHTML = '<span style="color: #e74c3c;">⚠️ Fall Risk Detected</span>';
    } else {
        statusDisplay.innerHTML = '<span style="color: #2ecc71;">Normal</span>';
    }
}

function logAlert(message) {
    const alertLog = document.getElementById('alert-log');
    const timestamp = new Date().toLocaleTimeString();
    const alertElement = document.createElement('div');
    alertElement.className = 'alert-item';
    alertElement.innerHTML = `<strong>${timestamp}</strong>: ${message}`;
    alertLog.insertBefore(alertElement, alertLog.firstChild);
}

function playAlertSound() {
    const alertSound = document.getElementById('alertSound');
    alertSound.currentTime = 0;
    alertSound.play().catch(function(error) {
        console.log("Audio play failed:", error);
    });
}

function stopMonitoring() {
    isMonitoring = false;
    webcam.stop();
    
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset all states
    fallStartTime = null;
    fallAlerted = false;
    
    // Clear labels
    if (labelContainer) {
        labelContainer.innerHTML = '';
    }

    // Reset status display
    const statusDisplay = document.getElementById('status-display');
    statusDisplay.innerHTML = '<span style="color: #95a5a6;">Monitoring Inactive</span>';

    // Disable stop button
    const stopButton = document.getElementById("stopButton");
    stopButton.classList.add("button-disabled");
    
    logAlert("Monitoring stopped");
}

// New emergency function
function triggerEmergency() {
    // Play alert sound immediately
    playAlertSound();
    
    // Log the manual emergency trigger
    logAlert("⚠️ EMERGENCY - Manual trigger activated");
    
    // Update status display to show emergency
    const statusDisplay = document.getElementById('status-display');
    statusDisplay.innerHTML = '<span style="color: #e74c3c; font-weight: bold;">⚠️ EMERGENCY TRIGGERED</span>';
    
    // Optional: Add visual feedback to the emergency button
    const emergencyButton = document.querySelector('.emergency-button');
    emergencyButton.style.backgroundColor = '#c0392b';
    
    // Reset button style after 2 seconds
    setTimeout(() => {
        emergencyButton.style.backgroundColor = '';
    }, 2000);
    
    // Optional: You could add more emergency actions here
    // For example: Send notifications, call emergency services, etc.
}

// Event listeners
window.addEventListener('resize', () => {
    if (isMonitoring && webcam) {
        const container = document.querySelector('.canvas-container');
        const size = Math.min(container.offsetWidth, container.offsetHeight);
        const canvas = document.getElementById("canvas");
        canvas.width = size;
        canvas.height = size;
    }
});