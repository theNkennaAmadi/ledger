import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import lottie from 'lottie-web';

gsap.registerPlugin(TextPlugin);


class Home {
    constructor(container) {
        this.container = container;
        this.introVideo = this.container.querySelector('#intro-video');
        this.mainVideo = this.container.querySelector('#main-video');
        this.nextBtn = [...this.container.querySelectorAll('[data-nav-next]')];
        this.prevBtn = [...this.container.querySelectorAll('[data-nav-prev]')];
        this.prevBtnText = [...this.container.querySelectorAll('[prev-btn-text]')];
        this.nextBtnText = [...this.container.querySelectorAll('[next-btn-text]')];
        this.currentIndex = 0;
        this.mainVideo.currentTime = 0;
        this.timelines = [
            {name: 'downtown', start: 0.00, end: 3.18, element: this.container.querySelector('[data-point="hud"]'), text: '[01] Downtown', lottiePercentage: 0, dataEgg: this.container.querySelector('[data-egg="hud"]')},
            {name: 'nano square', start: 9.15, end: 12.35, element: this.container.querySelector('[data-point="brand"]'), text: '[02] Nano Square', lottiePercentage: 25, dataEgg: this.container.querySelector('[data-egg="brand"]')},
            {name: 'financial district', start: 18.15, end: 21.35, element: this.container.querySelector('[data-point="creative"]'), text: '[03] Financial District', lottiePercentage: 65, dataEgg: this.container.querySelector('[data-egg="creative"]')},
            {name: 'ledger hq', start: 27.15, end: 30.35, element: this.container.querySelector('[data-point="tone"]'), text: '[04] Ledger HQ', lottiePercentage: 95},
        ];
        this.timePoints = this.timelines.map(t => t.start);
        this.dots = this.timelines.map(t => t.element);
        this.dotsMarker = this.dots.map(t => t.querySelector('.click-marker'));
        this.eggs = this.timelines.map(t => t.dataEgg);
        this.interval = null;
        this.steps = 0;
        this.isTransitioning = false;
        this.dotsDuration = 2
        this.dotsEase = 'expo.inOut'
        this.init();
        const lottieWebflow = Webflow.require("lottie").lottie;
        this.animations = lottieWebflow.getRegisteredAnimations();
        //console.log(this.animations);
        this.map = this.animations.find(a => a.fileName=== '6634edb575decb69d5ec8012_MiniMap');
        this.map2 = lottie.loadAnimation({
            container: document.querySelector('#lottieContainer'),
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: 'https://cdn.prod.website-files.com/66e2c7184554159d93c61613/6708e9b21a29419e0ab3dbf5_MiniMap.json'
        });
        //console.log(this.map);
        console.log('hello')
    }

    init() {
        gsap.set(this.dotsMarker, {rotate: -45});
        this.introVideo.addEventListener('ended', () => {
            const mainTimeline = gsap.timeline();

            mainTimeline
                .to(this.introVideo.parentElement, {display: 'none'})
                .to(this.mainVideo.parentElement, {display: 'block'}, "<")
                .to(this.eggs[0], {opacity: 1, pointerEvents: 'auto', duration: this.dotsDuration}, "<")
                .to(this.dots[0], {scale: 1, duration: this.dotsDuration, ease: this.dotsEase}, "<")
                .to(this.dotsMarker[0], {rotate: 0, duration:this.dotsDuration, ease: this.dotsEase}, "<")

                .call(() => {
                    this.initVideoControl();
                    this.initMouseScrubbing();
                });

            mainTimeline.play();
        });
    }

    initVideoControl() {
        this.nextBtn.forEach(btn => btn.addEventListener('click', () => this.handleNextClick()));
        this.prevBtn.forEach(btn => btn.addEventListener('click', () => this.handlePrevClick()));
        document.querySelector('.controls').addEventListener('mouseenter', () => {
            this.isOut = true;
        });
        document.querySelector('.controls').addEventListener('mouseleave', () => {
            this.isOut = false;
        });
    }

    initMouseScrubbing() {
        let targetTime = this.mainVideo.currentTime;
        let lastTime = this.mainVideo.currentTime;

        this.container.addEventListener('mousemove', (e) => {
            if (!this.isTransitioning && !this.isOut) {
                const rect = this.container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                const percentage = x / width;

                const currentTimeline = this.timelines[this.currentIndex];
                targetTime = currentTimeline.start + (currentTimeline.end - currentTimeline.start) * percentage;

                // Kill any existing tween to prevent conflicts
                if (this.mouseScrubTween) {
                    this.mouseScrubTween.kill();
                }

                // Create a new tween for smooth scrubbing
                this.mouseScrubTween = gsap.to(this.mainVideo, {
                    currentTime: targetTime,
                    duration: (targetTime - lastTime) , // Adjust the duration for smoother transitions
                    ease: "circ.out", // Easing for smooth parallax-like movement
                    overwrite: true,
                });
            }
        });


    }


    smoothProgress(startTime, endTime) {
        this.isTransitioning = true;
        const duration = 4;
        const frameRate = 60;

        // Kill any existing mouse scrub tween
        if (this.mouseScrubTween) {
            this.mouseScrubTween.kill();
        }

        if (startTime === this.timePoints[0] && endTime === this.timePoints[this.timePoints.length - 1]) {
            this.steps = frameRate * (duration / Math.abs(this.mainVideo.duration - endTime));
        } else {
            this.steps = frameRate * (duration / Math.abs(startTime - endTime));
        }

        const stepTime = duration / this.steps;
        const timeStep = (endTime - startTime) / this.steps;
        let currentStep = 0;

        clearInterval(this.interval);

        // Animate Lottie
        const prevIndex = (this.currentIndex - 1 + this.timelines.length) % this.timelines.length;
        const startPercentage = this.timelines[prevIndex].lottiePercentage;
        const endPercentage = this.timelines[this.currentIndex].lottiePercentage;
        console.log(startPercentage, endPercentage);
        const lottieStep = (endPercentage - startPercentage) / this.steps;

        this.interval = setInterval(() => {
            currentStep++;
            this.mainVideo.currentTime = startTime + timeStep * currentStep;

            // Update Lottie animation
            const lottiePercentage = Math.max(0, Math.min(100, startPercentage + lottieStep * currentStep));
            console.log(lottiePercentage);
            this.map?.goToAndStop(lottiePercentage * this.map.totalFrames / 100, true);

            if (currentStep >= this.steps) {
                gsap.to(this.eggs[this.currentIndex], {opacity: 1, pointerEvents: 'auto', duration: this.dotsDuration})
                gsap.to(this.dots[this.currentIndex], {scale: 1, duration: this.dotsDuration, ease: this.dotsEase})
                gsap.to(this.dotsMarker[this.currentIndex], {
                    rotate: 0, duration: this.dotsDuration, ease: this.dotsEase, overwrite: true,
                    onComplete: () => {
                        if (this.currentIndex === 0) {
                            this.mainVideo.currentTime = 0;
                        }
                        this.isTransitioning = false;
                    }
                })
                clearInterval(this.interval);
            }
        }, stepTime * 1000);
    }

    updateButtonText() {
        const prevIndex = (this.currentIndex - 1 + this.timelines.length) % this.timelines.length;
        const nextIndex = (this.currentIndex + 1) % this.timelines.length;

        const percentage = 50
        const duration = 0.5

        this.prevBtnText.forEach(element => {
            gsap.to(element, {opacity: 0, yPercent: percentage, duration: duration, onComplete: () => {
                    gsap.to(element, {opacity: 1, yPercent: 0, text: this.timelines[prevIndex].text, duration: duration});
                }});
        });

        this.nextBtnText.forEach(element => {
            gsap.to(element, {opacity: 0, yPercent:percentage, duration: duration, onComplete: () => {
                    gsap.to(element, {opacity: 1, yPercent:0, text: this.timelines[nextIndex].text , duration: duration});
                }});
        });
    }



    handleNextClick() {
        let mIndex = this.currentIndex
        gsap.to(this.eggs[this.currentIndex], {opacity: 0, pointerEvents: 'none', duration: this.dotsDuration})
        gsap.to(this.dots[this.currentIndex], {scale: 0, duration: this.dotsDuration, ease: this.dotsEase})
        gsap.to(this.dotsMarker[this.currentIndex], {rotate: -45, duration: this.dotsDuration, ease: this.dotsEase})
        this.currentIndex = (this.currentIndex + 1) % this.timePoints.length;
        const startTime = this.mainVideo.currentTime;
        let endTime = this.currentIndex === 0 ? this.mainVideo.duration : this.timePoints[this.currentIndex];
        this.updateButtonText();
        this.smoothProgress(startTime, endTime);
    }

    handlePrevClick() {
        if (this.currentIndex === 0) {
            // Special handling for transitioning from first to last section
            this.isTransitioning = true;
            gsap.to(this.eggs[this.currentIndex], {opacity: 0, pointerEvents: 'none', duration: this.dotsDuration})
            gsap.to(this.dots[this.currentIndex], {scale: 0, duration: this.dotsDuration, ease: this.dotsEase})
            gsap.to(this.dotsMarker[this.currentIndex], {rotate: -45, duration: this.dotsDuration, ease: this.dotsEase})

            // First, scrub to time 0
            gsap.to(this.mainVideo, {
                currentTime: 0,
                duration: this.mainVideo.currentTime/2,
                ease: "circ.out",
                onComplete: () => {
                    // Instantly set to the end of the video
                    this.mainVideo.currentTime = this.mainVideo.duration;

                    // Update the current index
                    this.currentIndex = this.timelines.length - 1;

                    // Then scrub from the end to the start time of the last section
                    const endTime = this.timelines[this.currentIndex].start;
                    this.smoothProgress(this.mainVideo.duration, endTime);
                }
            });
        } else {
            // Handle normal previous click for other indices
            gsap.to(this.eggs[this.currentIndex], {opacity: 0, pointerEvents: 'none', duration: this.dotsDuration})
            gsap.to(this.dots[this.currentIndex], {scale: 0, duration: this.dotsDuration, ease: this.dotsEase})
            gsap.to(this.dotsMarker[this.currentIndex], {rotate: -45, duration: this.dotsDuration, ease: this.dotsEase})
            this.currentIndex = (this.currentIndex - 1 + this.timelines.length) % this.timelines.length;
            const startTime = this.mainVideo.currentTime;
            const endTime = this.timelines[this.currentIndex].start;
            this.smoothProgress(startTime, endTime);
        }
        this.updateButtonText();
    }
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const home = new Home(document.querySelector('.wrapper'));
    }, 500);
});