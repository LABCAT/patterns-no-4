import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/patterns-no-4.ogg";
import midi from "../audio/patterns-no-4.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[8].notes; // Thor 2 - Colorbox Bass
                    const noteSet2 = result.tracks[1].notes; // Maelstrom 1 - [Dave] - [Mono]
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.originalSize = 0;
        p.size = 0;
        p.fillHue = 0;
        p.shapeCount = 0;
        p.shapes = [];
        p.shapeTypes = ['ellipse', 'rect', 'centeredTriangle', 'pentagon', 'hexagon']; 
        p.callShape = 'rect';
        p.callSizeMultiplier = 1;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            p.colorMode(p.HSB);
            p.angleMode(p.DEGREES);
            p.rectMode(p.CENTER);
            p.fillHue = p.random(0, 360);
            p.originalSize = p.height / 8 * 5;
            p.size = p.originalSize;
        }

        p.draw = () => {
            p.translate(p.width / 2, p.height / 2);
            if(p.audioLoaded && p.song.isPlaying()){
                for (let i = 0; i < p.shapes.length; i++) {
                    const shape = p.shapes[i],
                        { width, height, angle, shapeType, hue, strokeSat, strokeWeight } = shape;
                    p.fill(hue, 100, 100, 0.25);
                    p.stroke(hue, strokeSat, 100, 1);
                    p.strokeWeight(strokeWeight);
                    p[shapeType](0, 0, width, height);
                    p.rotate(angle);
                }
            }
        }

        p.executeCueSet1 = (note) => {
            const { currentCue } = note;
            if(
                currentCue <= 48 || 
                (currentCue > 95 && currentCue <= 143) ||    
                (currentCue > 190 && currentCue <= 238)
            ) {
                if(currentCue === 96 || currentCue === 191) {
                    p.background(0);
                    p.shapes = [];
                    p.shapeCount = 0;
                    p.size = p.originalSize;
                    p.fillHue = p.random(0, 360);
                    p.callShape = currentCue === 96 ? 'centeredTriangle' : 'pentagon';
                    p.callSizeMultiplier = p.random(1.5, 3);
                }
                
                p.shapes.push(
                    {
                        width: p.size * p.callSizeMultiplier,
                        height:p.size,
                        hue: p.fillHue,
                        angle: 120,
                        shapeType: p.callShape,
                        strokeSat: 100,
                        strokeWeight: 4,
                    }
                );
                p.fillHue = p.fillHue + 15 > 360 ? p.fillHue + 15 - 360 : p.fillHue + 15;
                p.shapeCount++;
                if(p.shapeCount % 3 === 0){
                    p.size = p.size / 10 * 9;
                }
            }
        }

        p.executeCueSet2 = (note) => {
            const { currentCue } = note;
            p.background(0);
            p.shapes = [];
            p.shapeCount = 0;
            p.size = p.originalSize;
            p.fillHue = p.random(0, 360);
            if(currentCue % 2 || 1 == 1) {
                const shape = p.random(p.shapeTypes),
                    sizeMultiplier = p.random([1, 2, 3, 5, 8, 13]),
                    angle = p.random([13, 21, 34, 55, 89, 144]);
                while(p.size > p.height / 32) {
                    p.shapes.push(
                        {
                            width: p.size,
                            height:p.size * sizeMultiplier,
                            angle: angle,
                            shapeType: shape,
                            hue: p.fillHue,
                            strokeSat: 0,
                            strokeWeight: 2,
                        }
                    );
                    p.fillHue = p.fillHue + 15 > 360 ? p.fillHue + 15 - 360 : p.fillHue + 15;
                    p.shapeCount++;
                    if(p.shapeCount % 3 === 0){
                        p.size = p.size / 10 * 9;
                    }
                }
            }
        }

        p.centeredTriangle = (x, y, width, height) => {
            const x1 = x,   
                y1 = y - (height/2), 
                x2 = x - (width/2),
                y2 = y + (height/2),
                x3 = x + (width/2),
                y3 = y + (height/2);
            p.triangle(x1, y1, x2, y2, x3, y3);
        }

        /**
         * function to draw a pentagon shape
         * @param {Number} x        - x-coordinate (center) of the pentagon
         * @param {Number} y        - y-coordinate (center) of the pentagon
         * @param {Number} width    - width of the pentagon
         * @param {Number} height   - height of the pentagon
         */
        p.pentagon = (x, y, width, height) => {
            height = height / 2;
            p.angleMode(p.RADIANS);
            const angle = p.TWO_PI / 5;
            let count = 0;
            p.beginShape();
            for (var a = p.TWO_PI / 20; a < p.TWO_PI + p.TWO_PI / 10; a += angle) {
                let sxMultiplier = count !== 1 ? width / 2 : height; 
                let sx = x + p.cos(a) * sxMultiplier;
                let sy = y + p.sin(a) * height;
                p.vertex(sx, sy);
                count++;
            }
            p.endShape(p.CLOSE);
            p.angleMode(p.DEGREES);
        }

        /**
         * function to draw a hexagon shape
         * @param {Number} x        - x-coordinate (center) of the hexagon
         * @param {Number} y        - y-coordinate (center) of the hexagon
         * @param {Number} width    - width of the hexagon
         * @param {Number} height   - height of the hexagon
         */
        p.hexagon = (x, y, width, height) => {
            height = height / 2;
            p.angleMode(p.RADIANS);
            const angle = p.TWO_PI / 6;
            let count = 0;
            p.beginShape();
            for (var a = p.TWO_PI / 12; a < p.TWO_PI + p.TWO_PI / 12; a += angle) {
                let sxMultiplier = count % 3 !== 1 ? width / 2 : height; 
                let sx = x + p.cos(a) * sxMultiplier;
                let sy = y + p.sin(a) * height;
                p.vertex(sx, sy);
                count++;
            }
            p.endShape(p.CLOSE);
            p.angleMode(p.DEGREES);
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
