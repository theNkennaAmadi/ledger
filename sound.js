const sounds = {
    introSound: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/Loading_Sound_intro%20(1).m4a?v=1719228646'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    bgSound: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/ledger-audio-city.m4a?v=1719228647'],
        loop: true,
        preload: false,
        volume: 0.3,
        html5: true,
    }),
    sound1: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/hover-sound-btn.mp3?v=1719228646'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    sound2: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/hot-spot.mp3?v=1719228646'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    sound3: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/bleep-1.mp3?v=1719228646'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    sound4: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/sweep.mp3?v=1719228646'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    sound5: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/cheerp.mp3?v=1719228646'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    sound6: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/blip-note.mp3?v=1719228646'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    soundActive: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/active-sound.mp3?v=1719228648'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    soundActive1: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/impact-hit.mp3?v=1719228648'],
        preload: false,
        volume: 0.6,
        html5: true,
    }),
    soundActive2: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/impact-hti-2.mp3?v=1719228648'],
        preload: false,
        volume: 0.2,
        html5: true,
    }),
    soundActive3: new Howl({
        src: ['https://cdn.jsdelivr.net/gh/JosephBerry1988/ledger-fr@main/Digital-Lock.mp3?v=1719228648'],
        preload: false,
        volume: 0.2,
        html5: true,
    })
};

class SoundManager {
    constructor(sounds) {
        this.sounds = sounds;
        this.currentSound = null;
        this.bgSoundName = document.querySelector('body').dataset.soundName;
        this.bgSound = sounds[this.bgSoundName];
        this.isMuted = false;
        this.isBgSoundPlaying = false;
        this.init();
    }

    loadAndPlaySound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            if (this.currentSound && this.currentSound.playing() && this.currentSound !== this.bgSound) {
                this.currentSound.stop();
            }
            if (sound.state() !== 'loaded') {
                sound.load();
            }
            sound.play();
            if (sound !== this.bgSound) {
                this.currentSound = sound;
            }
        }
    }

    playIntroSoundWithBg(soundName, bgSoundName) {
        const sound = this.sounds[soundName];
        const bgSound = this.sounds[bgSoundName];

        if (sound) {
            if (this.currentSound && this.currentSound.playing() && this.currentSound !== this.bgSound) {
                this.currentSound.stop();
            }
            if (sound.state() !== 'loaded') {
                sound.load();
            }
            sound.play();
            this.currentSound = sound;
        }

        this.playBgSound();
    }

    playBgSound() {
        if (this.bgSound && !this.isBgSoundPlaying) {
            if (this.bgSound.state() !== 'loaded') {
                this.bgSound.load();
            }
            this.bgSound.play();
            this.isBgSoundPlaying = true;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        Object.values(this.sounds).forEach(sound => {
            sound.mute(this.isMuted);
        });
    }

    init() {
        this.initIntroSound();
        this.initMuteButton();
        this.addTriggerListeners();
        this.initBgSound();
    }

    initIntroSound() {
        const introBtn = document.querySelector('[data-sound-intro]');
        if (introBtn) {
            const soundName = introBtn.dataset.soundName;
            introBtn.addEventListener('click', () => this.playIntroSoundWithBg(soundName, this.bgSoundName));
        }
    }

    initMuteButton() {
        const muteBtn = document.querySelector('[data-sound-mute]');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => this.toggleMute());
        }
    }

    addTriggerListeners() {
        const buttonsHover = document.querySelectorAll('[data-sound-trigger-hover]');
        const buttonsClick = document.querySelectorAll('[data-sound-trigger-click]');
        buttonsHover.forEach(button => {
            const soundName = button.dataset.soundTriggerHover;
            button.addEventListener('mouseenter', () => this.loadAndPlaySound(soundName));
        });
        buttonsClick.forEach(button => {
            const soundName = button.dataset.soundTriggerClick;
            button.addEventListener('click', () => this.loadAndPlaySound(soundName));
        });
    }

    initBgSound() {
        // Start playing the background sound when the page loads
        window.addEventListener('load', () => {
            this.playBgSound();
        });
    }
}


// Initialize the SoundManager and add listeners
const soundManager = new SoundManager(sounds);