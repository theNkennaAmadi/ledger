import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    const video = document.querySelector(".c-video");

    let progress = 0;

    // iOS requires user interaction, but this forces video "activation"
    video.play().then(() => {
        video.pause();
    });

    const updateVideo = () => {
        if (video.duration) {
            video.currentTime = progress * video.duration;
        }
    };

    // create a ScrollTrigger directly
    ScrollTrigger.create({
        trigger: ".wrapper",
        start: "top top",
        end: "83% bottom",
        scrub: true,
        onUpdate: (self) => {
            progress = self.progress; // 0 → 1
            updateVideo();
        }
    });
});
