<script>
  import { isDef } from 'element-ui/src/utils/shared';
  import scrollIntoView from 'element-ui/src/utils/scroll-into-view';
  export default {
      name: 'ElCascaderMenu',

      data() {
          return {
              inputWidth: 0,
              options: [],
              props: {},
              multiple: false,
              visible: false,
              activeValue: [],
              value: [],
              expandTrigger: 'click',
              changeOnSelect: false,
              popperClass: '',
              isSelected: {}
          };
      },

      watch: {
          visible(value) {
              if (value) {
                  this.valueChange();
              }
          },
          value: {
              immediate: true,
              handler(value) {
                  this.valueChange(value);
              }
          }
      },

      computed: {
          activeOptions: {
              cache: false,
              get() {
                  const activeValue = this.activeValue;
                  const configurableProps = ['label', 'value', 'children', 'disabled'];

                  const formatOptions = options => {
                      options.forEach(option => {
                          if (option.__IS__FLAT__OPTIONS) return;
                          configurableProps.forEach(prop => {
                              const value = option[this.props[prop] || prop];
                              if (value) option[prop] = value;
                          });
                          if (Array.isArray(option.children)) {
                              formatOptions(option.children);
                          }
                      });
                  };

                  const loadActiveOptions = (options, activeOptions = []) => {
                      const level = activeOptions.length;
                      activeOptions[level] = options;
                      let active = activeValue[level];
                      if (isDef(active)) {
                          options = options.filter(option => option.value === active)[0];
                          if (options && options.children) {
                              loadActiveOptions(options.children, activeOptions);
                          }
                      }
                      return activeOptions;
                  };

                  formatOptions(this.options);
                  return loadActiveOptions(this.options);
              }
          }
      },


      methods: {
          valueChange (val) {
              val = val || this.value;
              this.activeValue = (this.multiple
                  ? (val[val.length - 1] || [])
                  : val).slice(0);
              if (this.multiple) {
                  this.isSelected = {};
                  val.forEach(value => {
                      if (value && value.length > 0) {
                          this.isSelected[value[value.length - 1]] = true;
                      }
                  });
              }
          },
          select(item, menuIndex) {
              if (item.__IS__FLAT__OPTIONS) {
                  this.activeValue = item.value;
              } else if (menuIndex) {
                  this.activeValue.splice(menuIndex,
                      this.activeValue.length - 1, item.value);
              } else {
                  this.activeValue = [item.value];
              }
              let str = this.activeValue.join('');
              let value = [];
              if (this.multiple) {
                  value = this.value.filter(function(v) {
                      return v.join('') !== str;
                  });
                  if (value.length === this.value.length) {
                      value.push(this.activeValue.slice(0));
                  }
              } else if (this.value.join('') !== str) {
                  value = this.activeValue;
              } else {
                  value = this.value.slice(0);
              }

              this.value = value.slice(0);
              let close = !this.multiple; // 多选不关闭
              if (close) { // 非多选情况
                  if (item.children) { // 如果有子目录不关闭
                      close = false;
                  }
              }
              this.$emit('pick', value, close);
          },
          handleMenuLeave() {
              this.$emit('menuLeave');
          },
          activeItem(item, menuIndex) {
              const len = this.activeOptions.length;
              this.activeValue.splice(menuIndex, len, item.value);
              this.activeOptions.splice(menuIndex + 1, len, item.children);
              this.$emit('activeItemChange', this.activeValue);
          },
          scrollMenu(menu) {
              scrollIntoView(menu, menu.getElementsByClassName('is-active')[0]);
          },
          handleMenuEnter() {
              this.$nextTick(() => this.$refs.menus.forEach(menu => this.scrollMenu(menu)));
          },
          isActive (value, menuIndex) {
              if (typeof value !== 'object') {
                  return value === this.activeValue[menuIndex];
              } else if (toString.call(value) === '[object Array]') {
                  let last = value[value.length - 1];
                  return this.activeValue.length === value.length &&
                this.activeValue.indexOf(last) !== -1;
              }
              return false;
          },
      },

      render(h) {
          const {
              activeOptions,
              visible,
              expandTrigger,
              popperClass,
              isSelected,
              isActive
          } = this;

          const menus = this._l(activeOptions, (menu, menuIndex) => {
              let isFlat = false;
              const items = this._l(menu, item => {
                  const events = {
                      on: {}
                  };

                  if (item.__IS__FLAT__OPTIONS) isFlat = true;

                  if (item.children) {
                      let triggerEvent = {
                          click: 'click',
                          hover: 'mouseenter'
                      }[expandTrigger];
                      events.on[triggerEvent] = () => {
                          this.activeItem(item, menuIndex, triggerEvent);
                          this.$nextTick(() => {
                              // adjust self and next level
                              this.scrollMenu(this.$refs.menus[menuIndex]);
                              this.scrollMenu(this.$refs.menus[menuIndex + 1]);
                          });
                          if (triggerEvent === 'click' && !item.disabled &&
                                this.changeOnSelect) {
                              this.select(item, menuIndex);
                          }
                      };
                      if (triggerEvent !== 'click' && !item.disabled &&
                            this.changeOnSelect) {
                          events.on.click = () => {
                              this.select(item, menuIndex);
                          };
                      }
                  } else if (!item.disabled) {
                      events.on.click = () => {
                          this.select(item, menuIndex);
                          this.$nextTick(() => this.scrollMenu(this.$refs.menus[menuIndex]));
                      };
                  }
                  let selected = false;
                  if (Array.isArray(item.value)) {
                      selected = isSelected[item.value[item.value.length - 1]];
                  } else {
                      selected = isSelected[item.value];
                  }
                  return (
                      <li
                          class={{
                              'el-cascader-menu__item': true,
                              'el-cascader-menu__item--extensible': item.children,
                              'is-active': isActive(item.value, menuIndex),
                              'is-disabled': item.disabled,
                              'is-selected': selected
                          }}
                          {...events}
                      >
                          <span class=""> {item.label} </span>
                          { selected
                              ? (<i class='el-icon-check'></i>)
                              : null }
                      </li>
                  );
              });
              let menuStyle = {};
              if (isFlat) {
                  menuStyle.minWidth = this.inputWidth + 'px';
              }

              return (
                  <ul
                      class={{
                          'el-cascader-menu': true,
                          'el-cascader-menu--flexible': isFlat
                      }}
                      style={menuStyle}
                      refInFor
                      ref="menus">
                      {items}
                  </ul>
              );
          });
          return (
              <transition name="el-zoom-in-top" on-before-enter={this.handleMenuEnter} on-after-leave={this.handleMenuLeave}>
                  <div
                      v-show={visible}
                      class={[
                          'el-cascader-menus',
                          'el-cascader-menus-modified',
                          this.multiple ? 'is-multiple' : '',
                          popperClass
                      ]}
                      ref="wrapper"
                  >
                      {menus}
                  </div>
              </transition>
          );
      }
};
</script>
