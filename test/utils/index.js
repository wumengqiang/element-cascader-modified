
import Vue from 'vue';
import Cascader from '@/index';

Vue.component(Cascader.name, Cascader);

let id = 0;

function createElm() {
    const elm = document.createElement('div');

    elm.id = 'app' + ++id;
    document.body.appendChild(elm);

    return elm;
}

/**
 * 回收 vm
 * @param  {Object} vm
 */
function destroyVM(vm) {
    vm.$el &&
    vm.$el.parentNode &&
    vm.$el.parentNode.removeChild(vm.$el);
}

/**
 * 创建一个 Vue 的实例对象
 * @param  {Object|String}  Compo   组件配置，可直接传 template
 * @param  {Boolean=false} mounted 是否添加到 DOM 上
 * @return {Object} vm
 */
function createVue(Compo, mounted = false) {
    if (Object.prototype.toString.call(Compo) === '[object String]') {
        Compo = { template: Compo };
    }
    return new Vue(Compo).$mount(mounted === false ? null : createElm());
}


/**
 * 触发一个事件
 * mouseenter, mouseleave, mouseover, keyup, change, click 等
 * @param  {Element} elm
 * @param  {String} name
 * @param  {*} opts
 */
function triggerEvent(elm, name, ...opts) {
    let eventName;

    if (/^mouse|click/.test(name)) {
        eventName = 'MouseEvents';
    } else if (/^key/.test(name)) {
        eventName = 'KeyboardEvent';
    } else {
        eventName = 'HTMLEvents';
    }
    const evt = document.createEvent(eventName);

    evt.initEvent(name, ...opts);
    elm.dispatchEvent
        ? elm.dispatchEvent(evt)
        : elm.fireEvent('on' + name, evt);

    return elm;
}

/**
 * 触发 “mouseup” 和 “mousedown” 事件
 * @param {Element} elm
 * @param {*} opts
 */
function triggerClick(elm, ...opts) {
    triggerEvent(elm, 'mousedown', ...opts);
    triggerEvent(elm, 'mouseup', ...opts);

    return elm;
}

function sel(elm) {
    return document.querySelector(elm);
}

function selAll(elm) {
    return document.querySelectorAll(elm);
}

function removeEl(sel) {
    var nodes = document.querySelectorAll(sel);
    for (let i = 0, len = nodes.length; i < len; i++) {
        nodes[i].parentElement.removeChild(nodes[i]);
    }
}

export {
    destroyVM,
    createVue,
    triggerEvent,
    triggerClick,
    sel,
    selAll,
    removeEl
};
