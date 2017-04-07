'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (Vue) {
    Vue.directive('drag', draggable);
};

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 仅沿x或y或两轴移动
var moveX = void 0,
    moveY = void 0,
    moveAll = void 0;

function draggable(el, binding, vnode) {
    // 调整鼠标光标
    el.style.cursor = '-webkit-grab';

    // 获取指令绑定所在的组件上下文
    var instance = vnode.componentInstance || vnode.context;

    // 判断是否绑定了修饰符
    var modifiers = binding.modifiers;
    if (modifiers.x || modifiers.y) {
        if (modifiers.x) {
            moveX = true;
        }
        if (modifiers.y) {
            moveY = true;
        }
    } else {
        moveAll = true;
    }

    addListener(el, 'mousedown', onMousedown.bind(el));
    addListener(el, 'mouseup', onMouseup.bind(el));
    addListener(el, 'mousemove', onMousemove.bind(el));
    addListener(el, 'mouseleave', onMouseup.bind(el));

    // 当绑定了参数和值时，进行解绑和绑定
    if (binding.arg && binding.value) {
        switch (binding.arg) {
            case 'start':
                _removeAndAdd('mousedown', onMousedown);
                break;
            case 'end':
                _removeAndAdd('mouseup', onMouseup);
                break;
            case 'move':
                _removeAndAdd('mousemove', onMousemove);
                break;
            default:
                break;
        }
    }

    function _removeAndAdd(eventName, oldFn) {
        removeAndAdd(el, eventName, oldFn, getHandler(oldFn.bind(el), binding.value) // binding.value在传递时，使用了Vue工具方法bind, 所以不需要再次绑定上下文
        );
    }
}

function addListener(el, eventName, fn) {
    el.addEventListener(eventName, fn);
}

function removeListener(el, eventName, fn) {
    el.removeEventListener(eventName, fn);
}

/**
 * 移除再添加事件句柄
 * @param {HTMLElement} el 
 * @param {String} eventName 
 * @param {Function} oldFn 
 * @param {Function} newFn 
 */
function removeAndAdd(el, eventName, oldFn, newFn) {
    removeListener(el, eventName, oldFn);
    addListener(el, eventName, newFn);
}

function getHandler(fn) {
    for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
    }

    return function (event) {
        fn.apply(undefined, [event].concat(params));
    };
}

/**
 * 封装事件对象
 * @param {MouseEvent} event 
 * @param {HTMLElement} el 
 */
function getEvent(event, el) {
    return {
        el: el,
        x: event.screenX,
        y: event.screenY,
        initX: parseFloat(el.dataset.initX),
        initY: parseFloat(el.dataset.initY),
        moveX: event.screenX - el.dataset.initX,
        moveY: event.screenY - el.dataset.initY
    };
}

function onMousedown(event, cb) {
    this.style.cursor = '-webkit-grabbing';
    this.dataset.dragging = 1;
    this.dataset.initX = event.screenX;
    this.dataset.initY = event.screenY;

    cb && cb(getEvent(event, this));
}

function onMouseup(event, cb) {
    this.style.cursor = '-webkit-grab';
    this.dataset.dragging = 0;

    cb && cb(getEvent(event, this));
}

function onMousemove(event, cb) {
    if (this.dataset.dragging == 1) {
        var relX = event.screenX - this.dataset.initX;
        var relY = event.screenY - this.dataset.initY;

        if (moveAll || moveX && moveY) {
            this.style.transform = 'translate(' + relX + 'px, ' + relY + 'px)';
        } else if (moveX && !moveY) {
            this.style.transform = 'translateX(' + relX + 'px)';
        } else if (moveY && !moveX) {
            this.style.transform = 'translateY(' + relY + 'px)';
        }
    } else {
        return false;
    }

    cb && cb(getEvent(event, this));
}
