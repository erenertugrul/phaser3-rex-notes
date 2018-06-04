'use strict'

import EE from 'eventemitter3';
import GetSceneObject from './../../utils/system/GetSceneObject.js';
import IsArray from './../../utils/array/IsArray.js';

const GetValue = Phaser.Utils.Objects.GetValue;
const BetweenPoints = Phaser.Math.Angle.BetweenPoints;
const DistanceBetween = Phaser.Math.Distance.Between;
const RotateAroundDistance = Phaser.Math.RotateAroundDistance;
const Clamp = Phaser.Math.Clamp;
const Linear = Phaser.Math.Linear;

class Slider extends EE {
    constructor(gameobject, config) {
        super();
        this.gameobject = gameobject;
        this.scene = GetSceneObject(gameobject);

        this._value = undefined;
        this.endPoints = [{
                x: 0,
                y: 0
            },
            {
                x: 0,
                y: 0
            }
        ];
        this.dragEnable = null;
        this.resetFromJSON(config);
        this.boot();
    }

    resetFromJSON(o) {
        this.setValue(GetValue(o, "value", 0));
        var endPoints = GetValue(o, "endPoints", undefined);
        if (endPoints !== undefined) {
            this.setEndPoints(endPoints);
        }
        this.setDragEnable(GetValue(o, "dragEnable", true));
        return this;
    }

    toJSON() {
        return {
            enable: this.enable
        };
    }

    boot() {
        if (this.gameobject.on) {
            this.gameobject.on('drag', this.onDragging, this);
            this.gameobject.on('destroy', this.destroy, this);
        }
    }

    shutdown() {
        this.gameobject = undefined;
        this.scene = undefined;
        // gameobject event 'drag' will be removed when this gameobject destroyed 
    }

    destroy() {
        this.shutdown();
    }

    setDragEnable(e) {
        if (this.dragEnable === null) {
            this.gameobject.setInteractive(); // only need setInteractive once
        }

        e = !!e;
        if (this.dragEnable === e) {
            return this;
        }

        this.dragEnable = e;
        this.scene.input.setDraggable(this.gameobject, e);
        return this;
    }

    setEndPoints(p0x, p0y, p1x, p1y) {
        var points = this.endPoints;
        if (typeof (p0x) === 'number') {
            points[0].x = p0x;
            points[0].y = p0y;
            points[1].x = p1x;
            points[1].y = p1y;
        } else if (IsArray(p0x)) { // single array with 2 points
            points[0] = p0x[0];
            points[1] = p0x[1];
        } else {
            points[0] = p0x;
            points[1] = p0y;
        }
        this.axisRotation = BetweenPoints(points[0], points[1]);
        this.updatePos();
    }

    get value() {
        return this._value;
    }

    set value(value) {
        var oldValue = this._value;
        this._value = Clamp(value, 0, 1);

        if (oldValue !== this._value) {
            this.updatePos(this._value);
            this.emit('valuechange', this._value, oldValue);
        }
    }

    setValue(value) {
        this.value = value;
    }

    addValue(inc) {
        this.value += inc;
    }

    getValue(min, max) {
        if (min === undefined) {
            return this.value;
        } else {
            return Linear(min, max, this.value);
        }
    }

    get isDragging() {
        return (this.gameobject.input.dragState > 0);
    }    

    onDragging(pointer, dragX, dragY) {
        var endPoints = this.endPoints;
        var newValue;
        if (endPoints[0].y === endPoints[1].y) {
            var min = Math.min(endPoints[0].x, endPoints[1].x);
            var max = Math.max(endPoints[0].x, endPoints[1].x);
            newValue = (dragX - min) / (max - min);
        } else if (endPoints[0].x === endPoints[1].x) {
            var min = Math.min(endPoints[0].y, endPoints[1].y);
            var max = Math.max(endPoints[0].y, endPoints[1].y);
            newValue = (dragY - min) / (max - min);
        } else {
            var gameobject = this.gameobject;
            var dist;
            P1.x = dragX;
            P1.y = dragY;

            dist = DistanceBetween(P1.x, P1.y, gameobject.x, gameobject.y);
            P1 = RotateAroundDistance(P1, gameobject.x, gameobject.y, -this.axisRotation, dist);
            P1.y = gameobject.y;
            dist = DistanceBetween(P1.x, P1.y, gameobject.x, gameobject.y);
            P1 = RotateAroundDistance(P1, gameobject.x, gameobject.y, this.axisRotation, dist);

            var min = Math.min(endPoints[0].x, endPoints[1].x);
            var max = Math.max(endPoints[0].x, endPoints[1].x);
            newValue = (P1.x - min) / (max - min);
        }

        this.value = newValue;
    }

    updatePos() {
        var gameobject = this.gameobject;
        var points = this.endPoints;
        gameobject.x = Linear(points[0].x, points[1].x, this.value);
        gameobject.y = Linear(points[0].y, points[1].y, this.value);
    }
}

var P1 = {}; // reuse this point object

export default Slider;