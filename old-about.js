import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

class HorizontalScroller {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.content = this.container.querySelector('.scroll-about');
        this.draggable = null;
        this.scrollTrigger = null;
        this.maxScroll = 0;
        this.maxDrag = 0;
        this.init();
    }

    init() {
        const scroller = this; // Reference to the class instance

        function onResize(self) {
            scroller.maxDrag = scroller.content.scrollWidth - scroller.container.offsetWidth;
            scroller.maxScroll = self.end - self.start;

            // Update the bounds of the draggable
            if (scroller.draggable && scroller.draggable[0]) {
                scroller.draggable[0].applyBounds({
                    minX: -scroller.maxDrag,
                    maxX: 0,
                });
            }

            updateHandler(self);
        }

        function updateHandler(self) {
            if (scroller.draggable && scroller.draggable[0]) {
                // Calculate the scroll progress (0 to 1)
                let scrollPos = self.scroll() - self.start;
                let progress = scrollPos / scroller.maxScroll;

                // Update the content's x position based on scroll progress
                let x = -scroller.maxDrag * progress;
                gsap.set(scroller.content, { x: x });

                // Update the draggable instance
                scroller.draggable[0].update();
            }
        }

        // Create the ScrollTrigger instance
        this.scrollTrigger = ScrollTrigger.create({
            trigger: this.container,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${this.content.scrollWidth - this.container.offsetWidth}`,
            invalidateOnRefresh: true,
            markers: false,
            onRefresh: onResize,
            onUpdate: updateHandler,
        });

        // Create the Draggable instance
        this.draggable = Draggable.create(this.content, {
            type: "x",
            inertia: true,
            bounds: {
                minX: - (this.content.scrollWidth - this.container.offsetWidth),
                maxX: 0,
            },
            cursor: "unset",
            onDrag: function () {
                if (scroller.scrollTrigger) {
                    // Calculate the progress based on draggable position
                    let progress = -this.x / scroller.maxDrag;

                    // Update the scroll position based on progress
                    let scrollPos = scroller.scrollTrigger.start + progress * scroller.maxScroll;
                    scroller.scrollTrigger.scroll(scrollPos);
                }
            },
            onThrowUpdate: function () {
                if (scroller.scrollTrigger) {
                    let progress = -this.x / scroller.maxDrag;
                    let scrollPos = scroller.scrollTrigger.start + progress * scroller.maxScroll;
                    scroller.scrollTrigger.scroll(scrollPos);
                }
            },
        });
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    new HorizontalScroller('.sticky-child');
});

this.timelines = [
    {name: 'downtown', start: 0.00, end: 3.18, element: this.container.querySelector('[data-point="hud"]'), text: '[01] Downtown'},
    {name: 'nano square', start: 9.15, end: 12.35, element: this.container.querySelector('[data-point="brand"]'), text: '[02] Nano Square'},
    {name: 'financial district', start: 18.15, end: 21.35, element: this.container.querySelector('[data-point="creative"]'), text: '[03] Financial District'},
    {name: 'ledger hq', start: 27.15, end: 32.35, element: this.container.querySelector('[data-point="tone"]'), text: '[04] Ledger HQ'},
];

/*
const logo = document.querySelector('.icon-logo');
const start = document.querySelector('.')
const path = `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`;

 */