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
        this.transitionDuration = 6; // Adjust this value to control transition speed
        this.easeFunction = "slow(0.5,0.4,false)"; // Smoother easing function
    }

    init() {
        gsap.set(this.dotsMarker, {rotate: -45});
        this.introVideo.addEventListener('ended', () => {
            const mainTimeline = gsap.timeline();

            mainTimeline
                .to(this.introVideo.parentElement, {opacity: 0, duration: 1})
                .to(this.mainVideo.parentElement, {opacity: 1, duration: 1}, "<")
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
        let mouseX = 0;
        let rafId = null;

        const smoothScrub = () => {
            if (!this.isTransitioning && !this.isOut) {
                const rect = this.container.getBoundingClientRect();
                const containerWidth = rect.width;
                const activeWidth = Math.min(containerWidth, window.innerWidth * 0.7); // 70vw
                const insetLeft = (containerWidth - activeWidth) / 2;
                const insetRight = containerWidth - insetLeft;

                // Constrain mouseX to the active area
                const constrainedMouseX = Math.max(insetLeft, Math.min(mouseX, insetRight));
                const percentage = (constrainedMouseX - insetLeft) / activeWidth;

                const currentTimeline = this.timelines[this.currentIndex];
                targetTime = currentTimeline.start + (currentTimeline.end - currentTimeline.start) * percentage;

                // Interpolate between current time and target time
                const smoothFactor = 0.2; // Adjust this value to control smoothness (0.1 = 10% movement per frame)
                const newTime = gsap.utils.interpolate(this.mainVideo.currentTime, targetTime, smoothFactor);

                // Apply the new time
                this.mainVideo.currentTime = newTime;
            }

            rafId = requestAnimationFrame(smoothScrub);
        };

        this.container.addEventListener('mousemove', (e) => {
            if (!this.isTransitioning && !this.isOut) {
                const rect = this.container.getBoundingClientRect();
                mouseX = e.clientX - rect.left;

                // Start the smooth scrubbing if it's not already running
                if (!rafId) {
                    rafId = requestAnimationFrame(smoothScrub);
                }
            }
        });

        this.container.addEventListener('mouseleave', () => {
            // Stop the smooth scrubbing when the mouse leaves the container
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });

        // Optional: Visualize the active area
        //this.visualizeActiveArea();
    }

    visualizeActiveArea() {
        const activeArea = document.createElement('div');
        activeArea.style.position = 'absolute';
        activeArea.style.top = '0';
        activeArea.style.height = '100%';
        activeArea.style.width = '70vw';
        activeArea.style.maxWidth = '100%';
        activeArea.style.left = '50%';
        activeArea.style.transform = 'translateX(-50%)';
        activeArea.style.border = '2px solid rgba(255, 0, 0, 0.5)';
        activeArea.style.pointerEvents = 'none';
        this.container.appendChild(activeArea);
    }



    smoothProgress(startTime, endTime) {
        this.isTransitioning = true;
        const duration = this.transitionDuration;

        // Pre-calculate the total change in time
        const totalTimeDelta = endTime - startTime;

        // Create a proxy object to animate
        const proxy = { progress: 0 };

        // Stop any ongoing animations
        gsap.killTweensOf(this.mainVideo);
        gsap.killTweensOf(proxy);

        gsap.to(proxy, {
            progress: 1,
            duration: duration,
            ease: this.easeFunction,
            onUpdate: () => {
                // Calculate the current time based on the progress
                const currentTime = startTime + (totalTimeDelta * proxy.progress);

                // Update video time
                this.mainVideo.currentTime = currentTime;

                // Update Lottie animation
                const prevIndex = (this.currentIndex - 1 + this.timelines.length) % this.timelines.length;
                const startPercentage = this.timelines[prevIndex].lottiePercentage;
                const endPercentage = this.timelines[this.currentIndex].lottiePercentage;
                const lottiePercentage = gsap.utils.interpolate(startPercentage, endPercentage, proxy.progress);

                if (this.map && this.map.goToAndStop) {
                    this.map.goToAndStop(lottiePercentage * this.map.totalFrames / 100, true);
                }
            },
            onComplete: () => {
                gsap.to(this.eggs[this.currentIndex], {opacity: 1, pointerEvents: 'auto', duration: this.dotsDuration});
                gsap.to(this.dots[this.currentIndex], {scale: 1, duration: this.dotsDuration, ease: this.dotsEase});
                gsap.to(this.dotsMarker[this.currentIndex], {
                    rotate: 0,
                    duration: this.dotsDuration,
                    ease: this.dotsEase,
                    overwrite: true,
                    onComplete: () => {
                        if (this.currentIndex === 0) {
                            this.mainVideo.currentTime = 0;
                        }
                        this.isTransitioning = false;
                    }
                });
            }
        });
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
        if (this.isTransitioning) return;

        gsap.to(this.eggs[this.currentIndex], {opacity: 0, pointerEvents: 'none', duration: this.dotsDuration/2});
        gsap.to(this.dots[this.currentIndex], {scale: 0, duration: this.dotsDuration/2, ease: this.dotsEase});
        gsap.to(this.dotsMarker[this.currentIndex], {rotate: -45, duration: this.dotsDuration/2, ease: this.dotsEase});

        const startTime = this.mainVideo.currentTime;
        this.currentIndex = (this.currentIndex + 1) % this.timePoints.length;
        let endTime = this.currentIndex === 0 ? this.mainVideo.duration : this.timePoints[this.currentIndex];

        this.updateButtonText();
        this.smoothProgress(startTime, endTime);
    }

    handlePrevClick() {
        if (this.isTransitioning) return;

        gsap.to(this.eggs[this.currentIndex], {opacity: 0, pointerEvents: 'none', duration: this.dotsDuration/2});
        gsap.to(this.dots[this.currentIndex], {scale: 0, duration: this.dotsDuration/2, ease: this.dotsEase});
        gsap.to(this.dotsMarker[this.currentIndex], {rotate: -45, duration: this.dotsDuration/2, ease: this.dotsEase});

        let startTime = this.mainVideo.currentTime;
        this.currentIndex = (this.currentIndex - 1 + this.timelines.length) % this.timelines.length;
        let endTime = this.timePoints[this.currentIndex];

        if (this.currentIndex === this.timelines.length - 1 && startTime < endTime) {
            // Handle wrapping from start to end
            this.mainVideo.currentTime = this.mainVideo.duration;
            startTime = this.mainVideo.currentTime;
        }

        this.updateButtonText();
        this.smoothProgress(startTime, endTime);
    }
}

window.addEventListener('load', () => {
    setTimeout(() => {
      new Home(document.querySelector('.wrapper'));
    }, 500);
});