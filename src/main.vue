<template>
  <span
    class="el-cascader"
    :class="[
      {
        'is-opened': menuVisible,
        'is-disabled': disabled,
        'is-multiple': multiple,
        'show-values': showValues
      },
      size ? 'el-cascader--' + size : ''
    ]"
    @click="handleClick"
    @mouseenter="inputHover = true"
    @mouseleave="inputHover = false"
    ref="reference"
    v-clickoutside="handleClickoutside"
  >
    <el-input
      ref="input"
      :readonly="!filterable"
      :placeholder="((! multiple || showValues) && currentLabels.length) 
            ? undefined : placeholder"
      v-model="inputValue"
      @change="debouncedInputChange"
      :validate-event="false"
      :size="size"
      :disabled="disabled"
    >
      <template slot="icon">
        <i
          key="1"
          v-if="clearable && inputHover && currentLabels.length"
          class="el-input__icon el-icon-circle-close el-cascader__clearIcon"
          @click="clearValue"
        ></i>
        <i
          key="2"
          v-else
          class="el-input__icon el-icon-caret-bottom"
          :class="{ 'is-reverse': menuVisible }"
        ></i>
      </template>
    </el-input>
    <span class="el-cascader__label" v-show="inputValue === '' && !this.multiple">
      <template v-if="showAllLevels">
        <template v-for="(label, index) in currentLabels" >
          {{ label }}
          <span v-if="index < currentLabels.length - 1"> / </span>
        </template>
      </template>
      <template v-else>
        {{ currentLabels[currentLabels.length - 1] }}
      </template>
    </span>
    <span class="el-cascader__tags" 
        v-if="inputValue === '' && multiple && showValues">
        <el-tag
          v-for='(tag, index) in currentLabels'
          :key='tag.toString()'
          :closable='true'
          type='primary'
          @close='cancelSelect(tag, index)'>
            {{showAllLevels ? tag.join(' / ') : tag[tag.length-1]}}
        </el-tag>
    </span>
  </span>
</template>

<script>
import Vue from 'vue';
import ElCascaderMenu from './menu';
import ElInput from 'element-ui/packages/input';
import ElTag from 'element-ui/packages/tag';
import Popper from 'element-ui/src/utils/vue-popper';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import emitter from 'element-ui/src/mixins/emitter';
import Locale from 'element-ui/src/mixins/locale';
import { t } from 'element-ui/src/locale';
import debounce from 'throttle-debounce/debounce';

// import './styles/index.css';

const popperMixin = {
    props: {
        placement: {
            type: String,
            default: 'bottom-start'
        },
        appendToBody: Popper.props.appendToBody,
        appendEl: {
            type: String,
            default: 'body'
        },
        offset: Popper.props.offset,
        boundariesPadding: Popper.props.boundariesPadding,
        popperOptions: Popper.props.popperOptions
    },
    methods: Popper.methods,
    data: Popper.data,
    beforeDestroy: Popper.beforeDestroy
};

export default {
    name: 'ElCascaderModified',

    directives: { Clickoutside },

    mixins: [popperMixin, emitter, Locale],

    components: {
        ElInput,
        ElTag
    },

    props: {
        options: {
            type: Array,
            required: true
        },
        props: {
            type: Object,
            default() {
                return {
                    children: 'children',
                    label: 'label',
                    value: 'value',
                    disabled: 'disabled'
                };
            }
        },
        value: {
            type: Array,
            default() {
                return [];
            }
        },
        placeholder: {
            type: String,
            default() {
                return t('el.cascader.placeholder');
            }
        },
        disabled: Boolean,
        clearable: {
            type: Boolean,
            default: false
        },
        changeOnSelect: Boolean,
        popperClass: String,
        expandTrigger: {
            type: String,
            default: 'click'
        },
        filterable: Boolean,
        size: String,
        showAllLevels: {
            type: Boolean,
            default: true
        },
        debounce: {
            type: Number,
            default: 300
        },
        beforeFilter: {
            type: Function,
            default: () => () => {}
        },
        multiple: {
            type: Boolean,
            default: false
        },
        showValues: {
            type: Boolean,
            default: false
        },
    },

    data() {
        return {
            currentValue: this.value || [],
            menu: null,
            debouncedInputChange() {},
            menuVisible: false,
            inputHover: false,
            inputValue: '',
            flatOptions: null
        };
    },

    computed: {
        labelKey() {
            return this.props.label || 'label';
        },
        valueKey() {
            return this.props.value || 'value';
        },
        childrenKey() {
            return this.props.children || 'children';
        },
        currentLabels() {

            if (this.multiple) {
                return this.getMultipleLabels();
            } else {
                return this.getCurrentLabels();
            }
        }
    },

    watch: {
        menuVisible(value) {
            value ? this.showMenu() : this.hideMenu();
        },
        value(value) {
            this.currentValue = value;
        },
        currentValue(value) {
            this.dispatch('ElFormItem', 'el.form.change', [value]);
        },
        options: {
            deep: true,
            handler(value) {
                if (!this.menu) {
                    this.initMenu();
                }
                this.flatOptions = this.flattenOptions(this.options);
                this.menu.options = value;
            }
        }
    },

    methods: {
        initMenu() {
            this.menu = new Vue(ElCascaderMenu).$mount();
            this.menu.options = this.options;
            this.menu.props = this.props;
            this.menu.expandTrigger = this.expandTrigger;
            this.menu.changeOnSelect = this.changeOnSelect;
            this.menu.popperClass = this.popperClass;
            this.menu.multiple = this.multiple;
            this.popperElm = this.menu.$el;
            if (!this.appendToBody && document.querySelector(this.appendEl)) {
                document.querySelector(this.appendEl).appendChild(this.popperElm);
            }
            this.menu.$on('pick', this.handlePick);
            this.menu.$on('activeItemChange', this.handleActiveItemChange);
            this.menu.$on('menuLeave', this.doDestroy);
        },
        showMenu() {
            if (!this.menu) {
                this.initMenu();
            }

            this.menu.value = this.currentValue.slice(0);
            this.menu.visible = true;
            this.menu.options = this.options;
            this.$nextTick(_ => {
                this.updatePopper();
                if (!this.popperOptions.onUpdate &&
                    this.popperOptions.preventOverflowOrder &&
                    this.popperOptions.preventOverflowOrder.indexOf('bottom') === -1 &&
                    this.popperOptions.preventOverflowOrder.indexOf('top') === -1) {
                    this.bindScroll = false;
                    this.popperJS.onUpdate(this.onUpdate);
                }
                this.menu.inputWidth = this.$refs.input.$el.offsetWidth - 2;
            });
        },
        onUpdate() { // fixbug 滚动导致的定位不准
            let node = this.popperElm;
            let nodes = [];
            let offsetY = 0;
            while (node !== document.body && node) {
                node = node.parentElement;
                if (!node) {
                    break;
                }
                nodes.push(node);
                offsetY += node.scrollTop;
                if (node.scrollTop ||
                    ['scroll', 'auto'].indexOf(window.getComputedStyle(node).overflow) !== -1 ||
                    ['scroll', 'auto'].indexOf(window.getComputedStyle(node)['overflow-y']) !== -1
                ) {
                    if (!this.bindScroll) {
                        if (node !== document.body && window.getComputedStyle(node).position === 'static') {
                            // eslint-disable-next-line no-console
                            // console.error('wish this element have relative position', node);
                            offsetY -= node.scrollTop;
                            continue;
                        } else {
                            node.addEventListener('scroll', this.popperJS.update.bind(this.popperJS));
                            this.bindScroll = true;
                            this.scrollNode = node;
                        }
                    }
                    break;
                }
            }

            if (offsetY > 0) {
                if (this.popperOptions.gpuAcceleration) { // 使用transform
                    let style = this.popperElm.style.transform;
                    if (style) {
                        let matches = style.match(/translate3d\( *(\w+), *(\w+), *(\w+) *\)/i);
                        let top = parseInt(matches[2]) + offsetY + 'px';
                        this.popperElm.style.transform = 'translate3d(' + matches[1] + ', ' + top + ', 0)';
                    }
                } else {
                    this.popperElm.style.top = parseInt(this.popperElm.style.top) + offsetY + 'px';
                }
            }

        },
        hideMenu() {
            this.inputValue = '';
            this.menu.visible = false;
        },
        handleActiveItemChange(value) {
            this.$nextTick(_ => {
                this.updatePopper();
            });
            this.$emit('active-item-change', value);
        },
        handlePick(value, close = true) {
            this.$emit('input', value);
            this.$emit('change', value);

            if (close) {
                this.menuVisible = false;
            } else {
                this.$nextTick(this.updatePopper);
            }
        },
        handleInputChange(value) {
            if (!this.menuVisible) return;
            const flatOptions = this.flatOptions;

            if (!value) {
                this.menu.options = this.options;
                this.$nextTick(this.updatePopper);
                return;
            }

            let filteredFlatOptions = flatOptions.filter(optionsStack => {
                return optionsStack.some(option => new RegExp(value, 'i').test(option[this.labelKey]));
            });

            if (filteredFlatOptions.length > 0) {
                filteredFlatOptions = filteredFlatOptions.map(optionStack => {
                    return {
                        __IS__FLAT__OPTIONS: true,
                        value: optionStack.map(item => item[this.valueKey]),
                        label: this.renderFilteredOptionLabel(value, optionStack)
                    };
                });
            } else {
                filteredFlatOptions = [{
                    __IS__FLAT__OPTIONS: true,
                    label: this.t('el.cascader.noMatch'),
                    value: '',
                    disabled: true
                }];
            }
            this.menu.options = filteredFlatOptions;
            this.$nextTick(this.updatePopper);
        },
        renderFilteredOptionLabel(inputValue, optionsStack) {
            return optionsStack.map((option, index) => {
                const label = option[this.labelKey];
                const keywordIndex = label.toLowerCase().indexOf(inputValue.toLowerCase());
                const labelPart = label.slice(keywordIndex, inputValue.length + keywordIndex);
                const node = keywordIndex > -1 ? this.highlightKeyword(label, labelPart) : label;
                return index === 0 ? node : [' / ', node];
            });
        },
        highlightKeyword(label, keyword) {
            const h = this._c;
            return label.split(keyword)
                .map((node, index) => index === 0 ? node : [
                    h('span', { class: { 'el-cascader-menu__item__keyword': true }}, [this._v(keyword)]),
                    node
                ]);
        },
        flattenOptions(options, ancestor = []) {
            let flatOptions = [];
            options.forEach((option) => {
                const optionsStack = ancestor.concat(option);
                if (!option[this.childrenKey]) {
                    flatOptions.push(optionsStack);
                } else {
                    if (this.changeOnSelect) {
                        flatOptions.push(optionsStack);
                    }
                    flatOptions = flatOptions.concat(this.flattenOptions(option[this.childrenKey], optionsStack));
                }
            });
            return flatOptions;
        },
        clearValue(ev) {
            ev.stopPropagation();
            this.handlePick([], true);
        },
        handleClickoutside() {
            this.menuVisible = false;
        },
        handleClick() {
            if (this.disabled) return;
            if (this.filterable) {
                this.menuVisible = true;
                this.$refs.input.$refs.input.focus();
                return;
            }
            this.menuVisible = !this.menuVisible;
        },
        getCurrentLabels () {
            let options = this.options;
            let labels = [];
            this.currentValue.forEach(value => {
                const targetOption = options && options.filter(option => option[this.valueKey] === value)[0];
                if (targetOption) {
                    labels.push(targetOption[this.labelKey]);
                    options = targetOption[this.childrenKey];
                }
            });
            return labels;
        },
        getMultipleLabels () {
            let labels = [];
            (this.currentValue || []).forEach(v => {
                let options = this.options;
                let label = [];
                v.forEach(value => {
                    const targetOption = options &&
                        options.filter(option => option[this.valueKey] === value)[0];
                    if (targetOption) {
                        label.push(targetOption[this.labelKey]);
                        options = targetOption[this.childrenKey];
                    }
                });
                if (label.length > 0) {
                    labels.push(label);
                }
            });
            return labels;
        },
        cancelSelect (tag, index) {
            const value = this.currentValue.slice(0);
            value.splice(index, 1);
            this.menu.value = value.slice(0);
            this.$emit('input', value);
            this.$emit('change', value);
        }
    },

    created() {
        this.debouncedInputChange = debounce(this.debounce, value => {
            const before = this.beforeFilter(value);

            if (before && before.then) {
                this.menu.options = [{
                    __IS__FLAT__OPTIONS: true,
                    label: this.t('el.cascader.loading'),
                    value: '',
                    disabled: true
                }];
                before
                    .then(() => {
                        this.$nextTick(() => {
                            this.handleInputChange(value);
                        });
                    });
            } else if (before !== false) {
                this.$nextTick(() => {
                    this.handleInputChange(value);
                });
            }
        });
        if (this.multiple && this.expandTrigger === 'click' && this.changeOnSelect) {
            // eslint-disable-next-line no-console
            console.error('当处于多选模式并且多级可选时，expandTrigger必须为hover');
        }
    },

    mounted() {
        this.flatOptions = this.flattenOptions(this.options);
    },

    beforeDestroy() {
        if (!this.appendToBody && this.appendEl && this.popperElm) {
            this.popperElm.parentElement.removeChild(this.popperElm);
        }
    }
};
</script>
<style lang='scss'>
    @import 'scss/index.scss';
</style>