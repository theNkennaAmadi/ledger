import { gsap } from "gsap";

class Typography {
    constructor() {
        this.typeFeatures = document.querySelectorAll('.type-feature');
        this.typeContent = document.querySelectorAll('.type-col-right > *');
        this.timeline = gsap.timeline();
        this.currentActiveIndex = null;
        this.init();
    }

    init() {
        this.addEventListeners();
        this.resetState();
        console.log('Typography initialized');
    }

    addEventListeners() {
        this.typeFeatures.forEach((feature, index) => {
            feature.addEventListener('mouseenter', () => this.handleHover(index));
            feature.addEventListener('mouseleave', () => this.handleMouseLeave());
        });
    }

    handleHover(index) {
        if (this.currentActiveIndex === index) return;

        gsap.killTweensOf(this.typeContent);

        this.timeline.clear();
        this.timeline.to(this.typeContent, {
            opacity: (i) => i === index ? 1 : 0.1,
            duration: 0.3,
            ease: "power2.out"
        });

        this.currentActiveIndex = index;
    }

    handleMouseLeave() {
        gsap.killTweensOf(this.typeContent);

        this.timeline.clear();
        this.timeline.to(this.typeContent, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out"
        });

        this.currentActiveIndex = null;
    }

    resetState() {
        gsap.set(this.typeContent, { opacity: 1 });
    }
}

// Initialize the Typography class
const typography = new Typography();