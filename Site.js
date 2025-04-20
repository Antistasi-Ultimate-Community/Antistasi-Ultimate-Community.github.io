function autoResizeText(selector) {
    const elements = document.querySelectorAll(selector);

    elements.forEach(el => {
        el.style.fontSize = ''; // Reset any previous inline font size
        const parent = el.parentElement;
        const minFontSize = 5; // Minimum font size
        let fontSize = 20; // Starting font size

        // Apply font size shrinking until the text fits both width and height
        while (el.scrollWidth > parent.offsetWidth || el.scrollHeight > parent.offsetHeight) {
            fontSize -= 1.5;
            el.style.fontSize = fontSize + 'px';

            // Stop if the font size is too small
            if (fontSize <= minFontSize) {
                break;
            }
        }
    });
}

// Apply auto-resize for h1 and card-middle-text-back
window.addEventListener('load', () => {
    autoResizeText('h1.card-text, .card-middle-text-back');
});

window.addEventListener('resize', () => {
    autoResizeText('h1.card-text, .card-middle-text-back');
});

document.querySelectorAll('.card-base').forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('.sticky-header');
    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

function copyToClipboard(element) {
    // Only get the text from the node, excluding the tooltip span
    const text = Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent.trim())
        .join("");

    navigator.clipboard.writeText(text);

    const tooltip = element.querySelector(".card-tooltip-text");
    tooltip.textContent = "Copied!";
    element.classList.add("show-tooltip");

    setTimeout(() => {
        tooltip.textContent = "Click to copy";
        element.classList.remove("show-tooltip");
    }, 1500);
}


let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const slideTextBackgrounds = document.querySelectorAll('.slide-text-background');
const slideTexts = document.querySelectorAll('.slide-text');
const slideTextSmall = document.querySelectorAll('.slide-text-small');
const dotsContainer = document.querySelector('.slider-dots');
const totalSlides = slides.length;

// Function to go to a specific slide
function goToSlide(index) {
    if (index >= totalSlides) {
        currentIndex = 0;  // Loop back to the first slide
    } else if (index < 0) {
        currentIndex = totalSlides - 1;  // Loop back to the last slide
    } else {
        currentIndex = index;
    }

    // Slide transition
    document.querySelector('.slider-track').style.transform = `translateX(-${currentIndex * 100}%)`;

    // Reset all backgrounds and text
    slideTextBackgrounds.forEach(bg => {
        bg.style.top = '-100%';
        const mainText = bg.querySelector('.slide-text');
        const smallText = bg.querySelector('.slide-text-small');
        if (mainText) mainText.style.top = '-50%';
        if (smallText) smallText.style.top = '-50%';
    });

    // Animate the selected slide's background and text
    setTimeout(() => {
        const activeBg = slideTextBackgrounds[currentIndex];
        activeBg.style.top = '0%';

        const mainText = activeBg.querySelector('.slide-text');
        const smallText = activeBg.querySelector('.slide-text-small');

        // Delay text animations
        if (mainText) {
            setTimeout(() => {
                mainText.style.top = '0';
            }, 1500); // First text delay
        }

        if (smallText) {
            setTimeout(() => {
                smallText.style.top = '0';
            }, 2000); // Second text delay (0.5s later)
        }

    }, 300); // Delay start of animation after slide transition

    // Update active dot
    updateActiveDot();
}

// Function to update active dot
function updateActiveDot() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
}

// Function to create and update dots
function createDots() {
    dotsContainer.innerHTML = ''; // Clear existing dots

    // Create the background if it doesn't exist
    let background = dotsContainer.querySelector('.dots-background');
    if (!background) {
        background = document.createElement('div');
        background.classList.add('dots-background');
        dotsContainer.appendChild(background);
    }

    // Create the dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    updateActiveDot();  // Set the initial active dot
    updateDotBackground();  // Adjust background for dots
}

// Function to update the background width based on the number of dots
function updateDotBackground() {
    const dots = document.querySelectorAll('.dot');
    const dotContainer = document.querySelector('.slider-dots');

    // Get the background container
    const background = dotContainer.querySelector('.dots-background');

    // Calculate the total width of all dots, including the gaps between them
    const dotWidth = 10; // The width of each dot
    const dotGap = 12; // The gap between dots
    const totalWidth = dots.length * (dotWidth + dotGap + 5); // Adjust for the last gap

    // Set the width of the background to fit the total width of the dots
    background.style.width = `${totalWidth}px`;
}

// Event listeners for arrows
document.querySelector('.slider-arrow.left').addEventListener('click', () => goToSlide(currentIndex - 1));
document.querySelector('.slider-arrow.right').addEventListener('click', () => goToSlide(currentIndex + 1));

// Initialize the slider and dots
createDots();  // Create the correct number of dots
goToSlide(currentIndex);  // Initialize the slider to the first slide

// === Autoplay ===
let autoplayInterval = setInterval(() => {
    goToSlide(currentIndex + 1);
}, 5000);

const sliderContainer = document.querySelector('.slider-container');
sliderContainer.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
sliderContainer.addEventListener('mouseleave', () => {
    autoplayInterval = setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 5000);
});

function openCity(evt, cityName) {
    const tabcontent = document.getElementsByClassName("mods-tabcontent");
    const tablinks = document.getElementsByClassName("mods-tablinks");

    // Hide all tab contents and remove "active" class
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show the selected tab and mark button as active
    document.getElementById(cityName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function toggleMobileMenu(button) {
    const menu = document.getElementById("mobileNav");
    menu.classList.toggle("active");
    button.classList.toggle("open");
}