import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);


const boxes = gsap.utils.toArray(".col-wrapper");
const items = [...document.querySelectorAll('.col')];

class AnimatedItem {
    // Static property to track all instances
    static instances = [];

    // Static method to close all other items
    static closeOthers(currentItem) {
        AnimatedItem.instances.forEach(instance => {
            if (instance !== currentItem && instance.isOpen) {
                instance.close(1.5);
            }
        });
    }

    constructor(element) {
        this.element = element;
        this.isAnimating = false;
        this.isOpen = false;

        // Add this instance to the static registry
        AnimatedItem.instances.push(this);

        // Cache DOM elements
        this.elements = {
            abContent: element.querySelector('.about-content-parent'),
            fadeIn: element.querySelector('.fade-in'),
            mono: [...element.querySelectorAll('.mono')],
            bdrBtm: element.querySelector('.border-line-btm'),
            bdrTop: element.querySelector('.border-line-top'),
            imgCover: element.querySelector('.img-cover'),
            heading: element.querySelector('.heading-xx-small'),
            bgWipe: element.querySelector('.bg-whipe')
        };

        // Initialize timelines
        this.tlIn = this.createInTimeline();
        this.tlOut = this.createOutTimeline();

        // Bind event handlers
        this.handleClick = this.handleClick.bind(this);

        // Set up initial state and event listeners
        this.init();
    }

    init() {
        this.resetElements();
        this.element.addEventListener('click', this.handleClick);
    }

    resetElements() {
        const { abContent, bdrTop, bdrBtm, imgCover, bgWipe, mono, heading, fadeIn } = this.elements;

        gsap.set(abContent, { display: 'none' });
        gsap.set(bdrTop, { width: '100%' });
        gsap.set(bdrBtm, { width: '0%' });
        gsap.set(imgCover, { scale: 1 });
        gsap.set(bgWipe, { opacity: 0, width: '102%', height: '0%' });
        gsap.set(mono, { y: '200%' });
        gsap.set(heading, { y: '100%' });
        gsap.set(fadeIn, { opacity: 0 });
    }

    createInTimeline() {
        const { abContent, bdrTop, imgCover, bdrBtm, bgWipe, mono, heading, fadeIn } = this.elements;

        const tl = gsap.timeline({
            paused: true,
            onReverseComplete: () => this.resetElements()
        });

        tl.set(abContent, { display: 'block', duration: 0.1 })
            .to(bdrTop, { width: '0%', duration: 1, ease: 'expo.inOut' }, '<')
            .to(imgCover, { scale: 1.2, duration: 1, ease: 'expo.inOut' }, '<')
            .to(bdrBtm, { width: '100%', duration: 1, ease: 'expo.inOut' }, '<')
            .to(bgWipe, { opacity: 1, width: '102%', height: '102%', duration: 1, ease: 'expo.inOut' }, '<')
            .to(mono, { y: '0%', duration: 1, ease: 'expo.inOut' }, "<0.1")
            .to(heading, { y: '0%', duration: 1, ease: 'expo.inOut' }, "<")
            .to(fadeIn, { opacity: 1, duration: 1 }, "<0.1");

        return tl;
    }

    createOutTimeline() {
        const { abContent, fadeIn, bdrBtm, bdrTop, mono, heading, bgWipe, imgCover } = this.elements;

        const tl = gsap.timeline({
            paused: true,
            onComplete: () => this.resetElements()
        });

        tl.to(fadeIn, { opacity: 0, duration: 0.5 })
            .to(bdrBtm, { width: '0%', duration: 0.5, ease: 'expo.inOut' }, '<')
            .to(bdrTop, { width: '100%', duration: 0.5, ease: 'expo.inOut' }, '<')
            .to(mono, { y: '200%', duration: 0.5, ease: 'expo.inOut' }, '<0.1')
            .to(heading, { y: '100%', duration: 0.5, ease: 'expo.inOut' }, '<')
            .to(bgWipe, { width: '102%', height: '0%', duration: 1, ease: 'expo.inOut' }, '<0.3')
            .to(imgCover, { scale: 1, duration: 1, ease: 'expo.inOut' }, '<')
            .to(bgWipe, { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, '<0.4')
            .set(abContent, { display: 'none', duration: 0.1 }, '>');

        return tl;
    }

    open() {
        if (this.isAnimating) return;

        this.isAnimating = true;

        // Close any other open items before opening this one
        AnimatedItem.closeOthers(this);

        this.tlIn.restart();
        this.tlIn.eventCallback('onComplete', () => {
            this.isAnimating = false;
            this.isOpen = true;
        });
    }

    close(time = 1) {
        if (this.isAnimating) return;

        this.isAnimating = true;

        this.tlOut.timeScale(time);
        this.tlOut.restart();
        this.tlOut.eventCallback('onComplete', () => {
            this.isAnimating = false;
            this.isOpen = false;
            this.resetElements();
        });
    }

    handleClick() {
        if (!this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    // Clean up method
    destroy() {
        // Remove from instances array
        const index = AnimatedItem.instances.indexOf(this);
        if (index > -1) {
            AnimatedItem.instances.splice(index, 1);
        }

        this.element.removeEventListener('click', this.handleClick);
        this.tlIn.kill();
        this.tlOut.kill();
    }
}

const animatedItems = items.map(item => new AnimatedItem(item));



const loop = horizontalLoop(boxes, {paused: true, draggable: true});


let progressWrap = gsap.utils.wrap(0, 1);

document.addEventListener("wheel", e => {

    loop.draggable.tween && loop.draggable.tween.kill();

    gsap.to(loop, {
        progress: `+=${e.deltaY * 0.01}`,
        overwrite: true,
        duration: 0.3,
        modifiers: {
            progress: progressWrap
        }
    })
});


/*
This helper function makes a group of elements animate along the x-axis in a seamless, responsive loop.

Features:
 - Uses xPercent so that even if the widths change (like if the window gets resized), it should still work in most cases.
 - When each item animates to the left or right enough, it will loop back to the other side
 - Optionally pass in a config object with values like draggable: true, speed (default: 1, which travels at roughly 100 pixels per second), paused (boolean), repeat, reversed, and paddingRight.
 - The returned timeline will have the following methods added to it:
   - next() - animates to the next element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
   - previous() - animates to the previous element using a timeline.tweenTo() which it returns. You can pass in a vars object to control duration, easing, etc.
   - toIndex() - pass in a zero-based index value of the element that it should animate to, and optionally pass in a vars object to control duration, easing, etc. Always goes in the shortest direction
   - current() - returns the current index (if an animation is in-progress, it reflects the final index)
   - times - an Array of the times on the timeline where each element hits the "starting" spot. There's also a label added accordingly, so "label1" is when the 2nd element reaches the start.
 */
function horizontalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
        length = items.length,
        startX = items[0].offsetLeft,
        times = [],
        widths = [],
        xPercents = [],
        curIndex = 0,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
        populateWidths = () => items.forEach((el, i) => {
            widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
            xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent"));
        }),
        getTotalWidth = () => items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0),
        totalWidth, curX, distanceToStart, distanceToLoop, item, i;
    populateWidths();
    gsap.set(items, { // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
        xPercent: i => xPercents[i]
    });
    gsap.set(items, {x: 0});
    totalWidth = getTotalWidth();
    for (i = 0; i < length; i++) {
        item = items[i];
        curX = xPercents[i] / 100 * widths[i];
        distanceToStart = item.offsetLeft + curX - startX;
        distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
        tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
            .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
            .add("label" + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
    }
    function toIndex(index, vars) {
        vars = vars || {};
        (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); // always go in the shortest direction
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (time > tl.time() !== index > curIndex) { // if we're wrapping the timeline's playhead, make the proper adjustments
            vars.modifiers = {time: gsap.utils.wrap(0, tl.duration())};
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        curIndex = newIndex;
        vars.overwrite = true;
        return tl.tweenTo(time, vars);
    }
    tl.next = vars => toIndex(curIndex+1, vars);
    tl.previous = vars => toIndex(curIndex-1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.updateIndex = () => curIndex = Math.round(tl.progress() * items.length);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
    }
    if (config.draggable && typeof(Draggable) === "function") {
        let proxy = document.createElement("div"),
            wrap = gsap.utils.wrap(0, 1),
            ratio, startProgress, draggable, dragSnap, roundFactor,
            align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
            syncIndex = () => tl.updateIndex();
        typeof(InertiaPlugin) === "undefined" && console.warn("InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club");
        draggable = Draggable.create(proxy, {
            trigger: items[0].parentNode,
            type: "x",
            onPress() {
                startProgress = tl.progress();
                tl.progress(0);
                populateWidths();
                totalWidth = getTotalWidth();
                ratio = 1 / totalWidth;
                dragSnap = totalWidth / items.length;
                roundFactor = Math.pow(10, ((dragSnap + "").split(".")[1] || "").length);
                tl.progress(startProgress);
            },
            onDrag: align,
            onThrowUpdate: align,
            inertia: true,
            cursor: "unset",
            onRelease: syncIndex,
            onThrowComplete: () => gsap.set(proxy, {x: 0}) && syncIndex()
        })[0];

        tl.draggable = draggable;
    }

    return tl;
}