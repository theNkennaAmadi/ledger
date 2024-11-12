import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";


gsap.registerPlugin(ScrollTrigger, Draggable);

let gallerySnap = null;
let galleryDrag = [];

class GalleryScroller {
    constructor(container) {
        this.initializeProperties(container);
        this.setupScrollTrigger();
        this.setupInitialAnimations();
    }

    initializeProperties(container) {
        this.iteration = 0;
        this.spacing = 0.15;
        this.snapTime = gsap.utils.snap(this.spacing);
        this.cards = [...container.querySelectorAll(".col-wrapper")];
        this.cardsCount = this.cards.length;
        this.cardsList = container.querySelector(".scroll-about");
        this.cardsListWrapper = container.querySelector(".sticky-child");
        this.sectionWrapper = container.querySelector(".about-parent");
        this.seamlessLoop = this.buildSeamlessLoop(
            this.cards,
            this.spacing,
            this.animateFunc.bind(this)
        );
        this.playhead = { offset: 0 };
        this.scroll = null;
        gallerySnap = () => this.scrollToOffset(this.scrub.vars.offset);
    }

    setupScrollTrigger() {
        this.trigger = ScrollTrigger.create({
            start: 0,
            onUpdate: this.onScrollUpdate.bind(this),
            end: `+=${this.cardsCount * 4 * 100}`,
            pin: this.cardsListWrapper,
            pinType: "fixed",
        });
        //ScrollTrigger.normalizeScroll(true);
        //ScrollTrigger.config({ ignoreMobileResize: true });

        ScrollTrigger.addEventListener("scrollEnd", gallerySnap);
    }

    setupInitialAnimations() {
        gsap.set(this.cards, { x: "100%", opacity: 1, scale: 1 });
        gsap.from(this.sectionWrapper, { autoAlpha: 0, duration: 1, ease: "expo" });

        this.scrub = gsap.to(this.playhead, {
            offset: 0,
            onUpdate: this.onScrubUpdate.bind(this),
            duration: 0.5,
            ease: "power3",
            paused: true,
        });

        window.scroll(0, 1);
        this.draggable();
    }

    animateFunc(element) {
        const tl = gsap.timeline();
        tl.fromTo(
            element,
            { scale: 1, opacity: 1 },
            {
                scale: 1,
                opacity: 1,
                zIndex: 100,
                duration: 0.5,
                yoyo: true,
                repeat: 1,
                ease: "power1.in",
                immediateRender: false,
            }
        ).fromTo(
            element,
            { x: "100%" },
            { x: "-100%", duration: 1, ease: "none", immediateRender: false },
            0
        );
        return tl;
    }

    buildSeamlessLoop(items, spacing, animateFunc) {
        let rawSequence = gsap.timeline({ paused: true }),
            seamlessLoop1 = gsap.timeline({
                paused: true,
                repeat: -1,
                onRepeat: () => {
                    this._time === this._dur && (this._tTime += this._dur - 0.01);
                },
                onReverseComplete: () => {
                    this.totalTime(this.rawTime() + this.duration() * 100);
                },
            }),
            cycleDuration = spacing * items.length,
            dur;

        items
            .concat(items)
            .concat(items)
            .forEach((item, i) => {
                let anim = animateFunc(items[i % items.length]);
                rawSequence.add(anim, i * spacing);
                dur || (dur = anim.duration());
            });

        seamlessLoop1.fromTo(
            rawSequence,
            { time: cycleDuration + dur / 2 },
            { time: "+=" + cycleDuration, duration: cycleDuration, ease: "none" }
        );
        return seamlessLoop1;
    }

    onScrubUpdate() {
        const wrapTime = gsap.utils.wrap(0, this.seamlessLoop.duration());
        this.seamlessLoop.time(wrapTime(this.playhead.offset));
    }

    onScrollUpdate(self) {
        const scroll = self.scroll();
        if (scroll > self.end - 1) {
            this.wrap(1, 2);
        } else if (scroll < 1 && self.direction < 0) {
            this.wrap(-1, self.end - 2);
        } else {
            const offset =
                (this.iteration + self.progress) * this.seamlessLoop.duration();
            if (offset !== this.scrub.vars.offset) {
                this.scrub.vars.offset = offset;
                this.scrub.invalidate().restart();
            }
        }
    }

    scrollToOffset(offset) {
        const snappedTime = this.snapTime(offset);
        const progress =
            (snappedTime - this.seamlessLoop.duration() * this.iteration) /
            this.seamlessLoop.duration();
        this.scroll = this.progressToScroll(progress);

        if (progress >= 1 || progress < 0) {
            this.wrap(Math.floor(progress), this.scroll);
            return;
        }

        this.trigger.scroll(this.scroll);
    }

    progressToScroll(progress) {
        return gsap.utils.clamp(
            1,
            this.trigger.end - 1,
            gsap.utils.wrap(0, 1, progress) * this.trigger.end
        );
    }

    wrap(iterationDelta, scrollTo) {
        this.iteration += iterationDelta;
        this.trigger.scroll(scrollTo);
        this.trigger.update();
    }


    draggable() {
        let scrub = this.scrub;
        let cardsList = this.cardsList;
        console.log(cardsList)
        let scrollToOffset = this.scrollToOffset.bind(this);
        console.log(Draggable)
        galleryDrag = Draggable.create(".drag-wrapper", {
            type: "x",
            trigger: cardsList,
            onPress() {
                this.startOffset = scrub.vars.offset;
            },
            onDrag() {
                scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
                scrub.invalidate().restart(); // same thing as we do in the ScrollTrigger's onUpdate
            },
            onDragEnd() {
                scrollToOffset(scrub.vars.offset);
            },
        });
        console.log(galleryDrag)
    }
}

new GalleryScroller(document.querySelector('.wrapper'))
