import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {Draggable} from "gsap/Draggable";
import {InertiaPlugin} from "gsap/InertiaPlugin";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

class HorizontalScroller {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.content = this.container.querySelector('.scroll-about');
        this.init();
    }

    getScrollAmount() {
        return -(this.content.scrollWidth - window.innerWidth);
    }

    init() {
        const scrollTween = gsap.to(this.content, {
            x: () => this.getScrollAmount(),
            ease: "none",
            paused: true
        });

        // Make the content draggable
        this.draggable = Draggable.create(this.content, {
            type: "x",
            inertia: true,
            bounds: {
                minX: this.getScrollAmount(),
                maxX: 0
            },
            onDrag: function() {
                scrollTween.progress(-this.x / scrollTrigger.end);
            },
            onThrowUpdate: function() {
                scrollTween.progress(-this.x / scrollTrigger.end);
            },
        });

        const scrollTrigger = ScrollTrigger.create({
            trigger: this.container,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${-this.getScrollAmount()}`,
            invalidateOnRefresh: true,
            markers: false,
            animation: scrollTween,
            onRefresh:()=>{
                // Update Draggable bounds on refresh
                this.draggable[0].applyBounds({
                    minX: this.getScrollAmount(),
                    maxX: 0,
                });
            }
        });


    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    new HorizontalScroller('.sticky-child');
});