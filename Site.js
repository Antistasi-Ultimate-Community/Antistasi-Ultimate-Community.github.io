function resizeTextToFit(elements) {
    elements.forEach(el => {
        const container = el.parentElement;

        if (!container) return;

        const computedStyle = window.getComputedStyle(container);
        const containerHeight = container.clientHeight
            - parseFloat(computedStyle.paddingTop)
            - parseFloat(computedStyle.paddingBottom);

        const containerWidth = container.clientWidth
            - parseFloat(computedStyle.paddingLeft)
            - parseFloat(computedStyle.paddingRight);

        // Reset font size first to avoid compounding
        el.style.fontSize = '100px';
        el.style.whiteSpace = 'nowrap'; // Try to keep it to one line if applicable

        const isTooltip = el.classList.contains('card-tooltip-text');
        const minFontSize = isTooltip ? 12 : 5;
        let fontSize = 100;

        // Temporarily make sure element is visible if it's hidden (like tooltips)
        const originalVisibility = el.style.visibility;
        el.style.visibility = 'hidden';
        el.style.display = 'block';
        el.style.position = 'absolute';

        while (
            (el.scrollHeight > containerHeight || el.scrollWidth > containerWidth) &&
            fontSize > minFontSize
        ) {
            fontSize -= 1;
            el.style.fontSize = fontSize + 'px';
        }

        // Restore original visibility
        el.style.visibility = originalVisibility;
        el.style.position = '';
    });
}


function resizeUITexts() {
    const headings = document.querySelectorAll('.card-top h1');
    const tooltips = document.querySelectorAll('.card-tooltip-text');
    const tooltiptext = document.querySelectorAll('.card-tooltip');
    const middlebacktext = document.querySelectorAll('.card-middle-text-back');
    const middletext = document.querySelectorAll('.card-middle-text');
    resizeTextToFit([...headings, ...tooltips, ...tooltiptext, ...middlebacktext, ...middletext]);
}

window.addEventListener('load', resizeUITexts);
window.addEventListener('resize', resizeUITexts);


function isMobile() {
    return window.innerWidth <= 768; // Adjust breakpoint if needed
}

if (isMobile()) {
    document.querySelectorAll('.card-base').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent flip if a non-flipping element is clicked
            if (!e.target.closest('.no-flip')) {
                if (e.target.closest("flipped")) {
                    card.classList.remove("flipped");
                } else {
                    card.classList.toggle('flipped');
                }
            }
        });
    });
}

// Dynamically toggle listeners on resize
let lastState = isMobile();
window.addEventListener('resize', () => {
    const currentState = isMobile();
    if (currentState !== lastState) {
        setFlipListeners(currentState);
        lastState = currentState;
    }
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
    // Get the data-value attribute from the element
    const dataToCopy = element.dataset.value;

    if (!dataToCopy) return; // Optional: prevent copying if no data-value present

    navigator.clipboard.writeText(dataToCopy);

    const tooltip = element.querySelector(".card-tooltip-text");
    if (tooltip) {
        tooltip.textContent = "Copied!";
        element.classList.add("show-tooltip");

        setTimeout(() => {
            tooltip.textContent = "Click to copy";
            element.classList.remove("show-tooltip");
        }, 1500);
    }
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

    slides.forEach(slide => slide.classList.remove('active'));
    slides[currentIndex].classList.add('active');

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

function toggleFAQ(button) {
    const allButtons = document.querySelectorAll('.faq-question');
    const allAnswers = document.querySelectorAll('.faq-answer');
    const faqBox = document.querySelector('.faq-box');

    const answer = button.nextElementSibling;
    const isExpanding = !button.classList.contains('active');

    // Reset all buttons except the clicked one
    allButtons.forEach(q => {
        if (q !== button) q.classList.remove('active');
    });

    // Close other answers
    allAnswers.forEach(a => {
        if (a !== answer && a.classList.contains('show')) {
            a.classList.remove('show');
            a.classList.add('hide');
            setTimeout(() => {
                if (a.classList.contains('hide')) a.style.display = 'none';
            }, 400);
        }
    });

    // Store current height
    const startHeight = faqBox.offsetHeight;
    faqBox.style.height = startHeight + 'px';

    if (isExpanding) {
        // Expand clicked
        button.classList.add('active');
        answer.style.display = 'block';

        requestAnimationFrame(() => {
            answer.classList.remove('hide');
            answer.classList.add('show');

            // Measure height after opening answer
            const endHeight = faqBox.scrollHeight;
            faqBox.style.transition = 'height 0.4s ease';
            faqBox.style.height = endHeight + 'px';
        });
    } else {
        // Collapse clicked
        button.classList.remove('active');
        answer.classList.remove('show');
        answer.classList.add('hide');

        // Measure height after hiding content
        const tempHeight = answer.offsetHeight;
        const endHeight = startHeight - tempHeight;

        faqBox.style.transition = 'height 0.6s ease';
        faqBox.style.height = endHeight + 'px';

        setTimeout(() => {
            answer.style.display = 'none';
        }, 400);
    }

    // Reset height to auto after animation
    setTimeout(() => {
        faqBox.style.transition = '';
        faqBox.style.height = 'auto';
    }, 600);
}

document.querySelectorAll('.team-member-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', function () {
        // Close all others
        document.querySelectorAll('.team-member-wrapper').forEach(w => {
            if (w !== this) w.classList.remove('active');
        });
        // Toggle this one
        this.classList.toggle('active');
    });
});

// Optional: Close when tapping outside
document.addEventListener('click', function (e) {
    if (!e.target.closest('.team-member-wrapper')) {
        document.querySelectorAll('.team-member-wrapper').forEach(w => w.classList.remove('active'));
    }
});