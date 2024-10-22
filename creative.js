import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Set up our scroll trigger
gsap.registerPlugin(ScrollTrigger);

/*
class SmoothVideoScrollScrubber {
    constructor(videoClassName = 'c-video-bg') {
        this.videos = Array.from(document.getElementsByClassName(videoClassName));
        this.scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        this.currentScrollPercentage = 0;
        this.targetScrollPercentage = 0;
        this.frameRate = 30; // Default to 30 fps
        this.lastTime = 0;
        this.init();
    }

    init() {
        if (this.videos.length === 0) {
            console.warn(`No videos found with class "${videoClassName}"`);
            return;
        }
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
        this.videos.forEach(video => {
            video.addEventListener('loadedmetadata', () => {
                this.frameRate = video.videoWidth > 1920 ? 60 : 30; // Estimate frame rate based on video resolution
            });
        });
        this.animate();
    }

    handleScroll() {
        const scrollPosition = window.pageYOffset;
        this.targetScrollPercentage = scrollPosition / this.scrollHeight;
        console.log(this.targetScrollPercentage);
    }

    handleResize() {
        this.scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    }

    animate(time) {
        if (this.lastTime !== 0) {
            const deltaTime = time - this.lastTime;
            const maxChange = (1 / this.frameRate) * (deltaTime / (1000 / this.frameRate));

            // Smoothly interpolate between current and target scroll percentage
            this.currentScrollPercentage += Math.max(
                -maxChange,
                Math.min(maxChange, this.targetScrollPercentage - this.currentScrollPercentage)
            );

            this.videos.forEach(video => {
                if (video.readyState >= 2 && isFinite(video.duration) && video.duration > 0) {
                    const newTime = video.duration * this.currentScrollPercentage;
                    if (isFinite(newTime) && newTime >= 0 && newTime <= video.duration) {
                        video.currentTime = newTime;
                    }
                }
            });
        }

        this.lastTime = time;
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
   // new SmoothVideoScrollScrubber('c-video-bg');
});

 */


/*
const video = document.querySelector(".c-video-bg");
let src = video.currentSrc || video.src;
console.log(video, src);

 */

/* Make sure the video is 'activated' on iOS */
/*
function once(el, event, fn, opts) {
    var onceFn = function (e) {
        el.removeEventListener(event, onceFn);
        fn.apply(this, arguments);
    };
    el.addEventListener(event, onceFn, opts);
    return onceFn;
}

once(document.documentElement, "touchstart", function (e) {
    video.play();
    video.pause();
});

 */

/* ---------------------------------- */
/* Scroll Control! */

/*
gsap.registerPlugin(ScrollTrigger);

let tl = gsap.timeline({
    defaults: { duration: 1 },
    scrollTrigger: {
        trigger: ".wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: true
    }
});

once(video, "loadedmetadata", () => {
    tl.fromTo(
        video,
        {
            currentTime: 0
        },
        {
            currentTime: video.duration || 1
        }
    );
});

 */

/* When first coded, the Blobbing was important to ensure the browser wasn't dropping previously played segments, but it doesn't seem to be a problem now. Possibly based on memory availability? */
/*
setTimeout(function () {
    if (window["fetch"]) {
        fetch(src)
            .then((response) => response.blob())
            .then((response) => {
                var blobURL = URL.createObjectURL(response);
                console.log(blobURL);

                var t = video.currentTime;
                once(document.documentElement, "touchstart", function (e) {
                    video.play();
                    video.pause();
                });
                console.log(t)

                video.setAttribute("src", blobURL);
                video.currentTime = t + 0.01;
            });
    }
}, 1000);

 */



document.addEventListener('DOMContentLoaded', () => {
    // Get the video element
    const video = document.querySelector(".c-video");


    // Play and pause the video to 'activate' it on iOS
    video.play().then(() => {
        video.pause();
    });

    // Create our animation
    gsap.to(video, {
        scrollTrigger: {
            trigger: ".wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
        },
        currentTime: video.duration,
        ease: 'power3.in',
    });
});



