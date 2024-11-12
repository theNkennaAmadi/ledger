import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

class InfiniteSlider {
    constructor() {
        this.slider = document.querySelector('.slider');
        this.slidesWrap = document.querySelector('.slides');
        this.originalSlides = [...document.querySelectorAll('.slide')];
        this.slideWidth = this.slider.offsetWidth;
        this.numSlides = this.originalSlides.length;
        this.currentIndex = 1; // Start at 1 because of the clone
        this.isDragging = false;
        this.resistance = 0.5;
        this.threshold = 0.15;
        this.snapDuration = 0.5;

        this.init();
    }

    init() {
        // Clone slides for infinite effect
        this.setupSlides();
        this.setPosition(-this.slideWidth * this.currentIndex);
        this.initDraggable();
        this.initWheel();

        // Handle resize
        window.addEventListener('resize', () => {
            this.slideWidth = this.slider.offsetWidth;
            this.setPosition(-this.slideWidth * this.currentIndex);
        });
    }

    setupSlides() {
        // Clone all slides for seamless wrapping
        const firstSet = this.originalSlides.map(slide => slide.cloneNode(true));
        const lastSet = this.originalSlides.map(slide => slide.cloneNode(true));

        // Add clones to DOM
        firstSet.forEach(slide => this.slidesWrap.prepend(slide));
        lastSet.forEach(slide => this.slidesWrap.appendChild(slide));

        // Update slides array with all slides including clones
        this.slides = [...document.querySelectorAll('.slide')];
    }

    setPosition(x, animate = false) {
        if (animate) {
            gsap.to(this.slidesWrap, {
                x,
                duration: this.snapDuration,
                ease: "power2.out",
                onComplete: () => this.checkBounds()
            });
        } else {
            gsap.set(this.slidesWrap, { x });
        }
    }

    initDraggable() {
        Draggable.create(this.slidesWrap, {
            type: "x",
            inertia: true,
            onDragStart: () => {
                this.isDragging = true;
                gsap.killTweensOf(this.slidesWrap);
            },
            onDrag: function() {
                if (this.x > 0 || this.x < -this.maxX) {
                    const edge = this.x > 0 ? 0 : -this.maxX;
                    const offset = this.x - edge;
                    this.x = edge + (offset * 0.5);
                }
            },
            onDragEnd: () => {
                this.isDragging = false;
                this.snap();
            },
            onThrowComplete: () => {
                this.snap();
            }
        });
    }

    initWheel() {
        let wheelTimeout;
        let wheelTotal = 0;
        const wheelThreshold = 50;

        this.slider.addEventListener('wheel', (e) => {
            e.preventDefault();
            wheelTotal += e.deltaY;

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (Math.abs(wheelTotal) > wheelThreshold) {
                    const direction = wheelTotal > 0 ? 1 : -1;
                    this.goToSlide(this.currentIndex + direction);
                }
                wheelTotal = 0;
            }, 50);
        }, { passive: false });
    }

    snap() {
        const x = gsap.getProperty(this.slidesWrap, "x");
        const progress = Math.abs(x / this.slideWidth);
        const snapIndex = Math.round(progress);
        this.goToSlide(snapIndex);
    }

    goToSlide(index) {
        this.currentIndex = index;
        const x = -index * this.slideWidth;
        this.setPosition(x, true);
    }

    checkBounds() {
        const x = gsap.getProperty(this.slidesWrap, "x");
        const totalSlides = this.slides.length;
        const originalLength = this.numSlides;

        // If we're at the clone before first slide
        if (this.currentIndex <= 0) {
            this.currentIndex = originalLength;
            this.setPosition(-this.slideWidth * this.currentIndex);
        }
        // If we're at the clone after last slide
        else if (this.currentIndex > originalLength * 2) {
            this.currentIndex = originalLength + 1;
            this.setPosition(-this.slideWidth * this.currentIndex);
        }
    }
}

// Initialize the slider
new InfiniteSlider();