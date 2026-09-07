// DOM elements
const elConvertBtn = document.getElementById("convert");
const elImageUpload = document.getElementById("image-upload");
const elUploadLabel = document.getElementById("upload-label");
const elContrastSlider = document.getElementById("contrast-slider");
const symbols = document.getElementById("symbols");
const elContrastValue = document.getElementById("contrast-value");
const asciiOutput = document.getElementById("ascii-output");
const elWidthInput = document.getElementById("width-input");

// Canvas setup
const elCanvas = document.getElementById("upload images");
const ctx = elCanvas.getContext("2d");

let contrastValue = 1;
//Ascii characters from light to dark
const defaultAsciiChars = [" ", ".", ":", "-", "=", "+", "*", "#", "@"];
const defaultWidth = 100;
let asciiChars = defaultAsciiChars;
let width = defaultWidth;

function drawImage(img) {
    const maxSize = 400;

    const scale = Math.min(maxSize / img.width, maxSize / img.height);

    const width = img.width * scale;
    const height = img.height * scale;

    elCanvas.width = width;
    elCanvas.height = height;

    const x = (elCanvas.width - width) / 2;
    const y = (elCanvas.height - height) / 2;

    ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
    ctx.drawImage(img, x, y, width, height);
}

// Event function on a new file upload - reads and runs drawImage()
function uploadImage() {
    const image = elImageUpload.files[0];

    if (!image.type.includes("image")) {
        return alert("Please upload a valid image file.");
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(image);

    fileReader.onload = (fileReaderEvent) => {
        const image = new Image();
        image.onload = () => {
            drawImage(image);
        };
        image.src = fileReaderEvent.target.result;
    }
}

// Helper function for greyscale
function RGBToGrayscale(r, g, b) {
    return (r * 6966 + g * 23436 + b * 2366) >> 15;
}

function greyscale() {
    const imageData = ctx.getImageData(0, 0, elCanvas.width, elCanvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];

        const grayscale = RGBToGrayscale(r, g, b);
        imageData.data[i] = grayscale;
        imageData.data[i + 1] = grayscale;
        imageData.data[i + 2] = grayscale;
    }
    ctx.putImageData(imageData, 0, 0);
}

function contrast(contrastValue) {
    const imageData = ctx.getImageData(0, 0, elCanvas.width, elCanvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        let value = imageData.data[i];

        value = (value - 128) * contrastValue + 128;
        value = Math.max(0, Math.min(255, value));

        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
    }
    ctx.putImageData(imageData, 0, 0);
}

function convertToAscii(width) {
    const imageData = ctx.getImageData(0, 0, elCanvas.width, elCanvas.height);

    const asciiWidth = width;

    const charAspectRatio = 0.5;

    const asciiHeight = Math.floor((imageData.height / imageData.width) * asciiWidth * charAspectRatio);

    let asciiImage = "";

    for (let y = 0; y < asciiHeight; y ++) {
        for (let x = 0; x < asciiWidth; x ++) {

            const pixelX = Math.floor((x / asciiWidth) * imageData.width);
            const pixelY = Math.floor((y / asciiHeight) * imageData.height);

            const index = (pixelY * imageData.width + pixelX) * 4;
            
            const alpha = imageData.data[index + 3];

            if (alpha === 0) {
                asciiImage += " ";
                continue;
            }

            const brightness = imageData.data[index];

            let charIndex = Math.floor((255 - brightness) * (asciiChars.length - 1) / 255);

            asciiImage += asciiChars[charIndex];
        }
        asciiImage += "\n";
    }
    return asciiImage;
}

function updateSymbols(string) {
    console.log(string);
    if (string.length === 0) {
        asciiChars = defaultAsciiChars;
        return;
    }
    let newasciiChars = [" "];
    for (let char of string) {
        if (char === " ") continue;
        newasciiChars.push(char);
    }
    asciiChars = newasciiChars;
    return;
}

function updateWidth(string) {
    if (string.length === 0) {
        width = defaultWidth;
        return;
    }
    if (!parseInt(string)) {
        console.log("Invalid width input. Please enter a valid integer.");
        return;
    }
    width = parseInt(string);
    console.log("Width updated to: " + width);
}

function convertbtn() {
    updateSymbols(symbols.value);
    updateWidth(elWidthInput.value);
    greyscale();
    contrast(contrastValue);
    asciiOutput.textContent = convertToAscii(width);
}

elContrastSlider.addEventListener("input", () => {
    contrastValue = parseFloat(elContrastSlider.value);
    elContrastValue.textContent = contrastValue.toFixed(1);
});

function copyToClipboard() {
    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText(asciiOutput.textContent);
            console.log("Copied to clipboard");
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };
    copyContent();
}

elImageUpload.addEventListener("change", () => {
    if (elImageUpload.files.length > 0) {
        elUploadLabel.style.display = "none";
    } else {
        elUploadLabel.style.display = "block";
    }
});

function clearCanvas() {
    ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
    elImageUpload.value = "";
}