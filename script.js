const settings = {
    capsuleNo: 20,
    isTurningHandle: false,
    isHandleLocked: false,
    handlePrevDeg: 0,
    handleDeg: 0,
    handleRotate: 0,
    flapRotate: 0,
    collectedNo: 0,
}

const elements = {
    wrapper: document.querySelector('.wrapper'),
    capsuleMachine: document.querySelector('.capsule-machine'),
    shakeButton: document.querySelector('.shake'),
    seeInsideButton: document.querySelector('.see-inside'),
    circle: document.querySelector('.circle'),
    handle: document.querySelector('.handle'),
    toyBox: document.querySelector('.toy-box'),
}

const vector = {
    x: 0,
    y: 0,
    create: function(x,y) {
        const obj = Object.create(this)
        obj.x = x
        obj.y = y
        return obj
    },
    setXy: function({x,y}) {
        this.x = x
        this.y = y
    },
    setAngle: function(angle) {
        const length = this.magnitude()
        this.x = Math.cos(angle) * length
        this.y = Math.sin(angle) * length
    },
    setLength: function(length) {
        const angle = Math.atan2(this.y,this.x)
        this.x = Math.cos(angle) * length
        this.y = Math.sin(angle) * length
    },
    magnitude: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    },
    multiply: function(v2) {
        this.x += v2.x
        this.y += v2.y
    },
    multiplyBy: function(n) {
        this.x *= n
        this.y *= n
    },
}

const rotatePoint = ({angle, axis, point}) => {
    const a = degToRad(angle)
    const aX = point.x - axis.x
    const aY = point.y - axis.y
    return {
        x: (aX * Math.cos(a)) - (aY * Math.sin(a)) + axis.x,
        y: (aX * Math.sin(a)) + (aY * Math.cos(a)) + axis.y,
    }
}

const px = num => `${num}px`
const randomN = max => Math.ceil(Math.random()* max)
const degToRad = deg => deg / (180 / Math.PI)
const radToDeg = rad => Math.round(rad * (180 / Math.PI))
const angleTo = ({a,b}) => Math.atan2(b.y - a.y, b.x - a.x)
const distanceBetween = (a,b) => Math.round(Math.sqrt(Math.pow((a.x-b.x),2)+ Math.pow((a.y - b.y),2)))
const getPage = (e,type) => e.type[0] === 'm' ? e[`page${type}`] : e.touches[0][`page${type}`]
const calcCollectedX = () => settings.collectedNo % 10 * 32
const calcCollectedY = () => Math.floor(settings.collectedNo / 10) * 32
const nearest360 = n => n === 0 ? 0 : (n-1) + Math.abs(((n-1)% 360) - 360)

const setStyles = ({el, x, y, w, deg}) => {
    if (w) el.style.width = w
    el.style.transform = `translate(${x ? px(x) : 0}, ${y ? px(y) : 0}) rotate(${deg || 0}deg)`
}

const lineData = [
    {
        start: {x:0, y: 280},
        end: { x: 160, y: 360},
        point: 'end',
        axis: 'start',
        id: 'flap_1'
    },
    {
        start: {x:160, y: 360},
        end: { x: 320, y: 280,},
        point: 'start',
        axis: 'end',
        id: 'flap_2'
    },
    {
        start: {x:70, y: 340},
        end: { x: 230, y: 490,},
        point: 'start',
        axis: 'end',
        id: 'ramp'
    }
]

const getRandomToy = () => {
    return ['bunny', 'duck-yellow', 'duck-pink', 'star', 'water-melon', 'panda', 'dino', 'roboto-sans', 'roboto-sama', 'penguin', 'turtle'][randomN(11)-1]
}

new Array(settings.capsuleNo).fill('').forEach(() => {
    const capsule = Object.assign(document.createElement('div'), {
        className: 'capsule-wrapper pix',
        innerHTML: `<div class="capsule">
        <div class="lid"><div>
        <div class=""${getRandomToy()} toy pix></div>
        <div class="base ${['red', 'pink', 'white', 'blue'][randomN(4) - 1]}"></div>
        </div>`
    })
    elements.capsuleMachine.appendChild(capsule)
})
lineData.forEach(() => {
    ;[
        Object.assign(document.createElement('div'), {
            className: 'line-start', innerHTML: '<div lcass="line"></div>'}),
            Object.assign(document.createElement('div'), {className: 'line-end'})
        ].forEach(ele => {
            elements.capsuleMachine.appendChild(ele)
        })
        })

        const lineStarts = document.querySelectorAll('.line-start')
        const lines = document.querySelectorAll('.line')
        const lineEnds = document.querySelectorAll('.line-end')
        const toys = document.querySelectorAll('.toy')
        const {width: capsuleMachineWidth, height: capsuleMachineHeight} =
        elements.capsuleMachine.getBoundingClientRect()

        const handleAxis = () => {
            const { left: handleX, top: handleY} = elements.circle.getBoundingClientRect()
            const { top, left} = elements.capsuleMachine.getBoundingClientRect()
            return {
                x: handleX - left + 80,
                y: handleY - top + 80
            }
        }

        const updateLines = () => {
            lineData.forEach((l,i) => {
                l.length = distanceBetween(l.start,l.end)
                setStyles({
                    el: lineStarts[i],
                    x: l.start.x,
                    y: l.start.y,
                    deg: radToDeg(angleTo({
                        a: l.start,
                        b: l.end
                    }))
                })
                setStyles({ el: lines[i], w: px(l.length)})
                setStyles({ el: lineEnds[1], x: l.end.x, y: l.end.y})
            })
        }