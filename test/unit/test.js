
import { createVue,
    destroyVM,
    triggerEvent,
    sel,
    selAll,
    removeEl} from '../utils/index.js';


describe('Cascader-modified basic', () => {
    let vm;
    afterEach(() => {
        destroyVM(vm);
        removeEl('.el-cascader-menus');
    });

    // 单选且只能选择叶子节点  菜单选择以及清空操作
    it('basic', done => {
        vm = createDemo();
        expect(vm.$el).to.be.exist;
        let cascader = sel('.el-cascader');
        expect(cascader).to.be.exist;
        new Promise((resolve, reject) => {
            // 点击弹出一级菜单
            cascader.click();
            setTimeout(() => {
                expect(sel('.el-cascader-menus')).to.be.exist;
                const level1Menus = selAll('.el-cascader-menu__item');
                expect(level1Menus, 'top menu items should exist').to.be.exist;
                expect(level1Menus.length, 'top menu items\'s length').to.equal(2);
                resolve();
            });
        }).then(() => {
            // 点击一级菜单显示二级菜单
            sel('.el-cascader-menu__item').click();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    expect(sel('.el-cascader-menus')).to.be.exist;
                    expect(selAll('.el-cascader-menu').length, 'Secondary menu exist').to.equal(2);
                    expect(selAll('.el-cascader-menu__item').length).to.equal(4);
                    expect(vm.selectedOptions.length).to.equal(0);
                    resolve();
                });
            });
        }).then(() => {
            // 点击二级菜单显示三级菜单
            selAll('.el-cascader-menu')[1]
                .querySelector('.el-cascader-menu__item').click();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    expect(sel('.el-cascader-menus')).to.be.exist;
                    expect(selAll('.el-cascader-menu').length,
                        'Third menu should exist').to.equal(3);
                    expect(vm.selectedOptions.length).to.equal(0);
                    resolve();
                });
            });
        }).then(() => {
            // 点击三级菜单选中并关闭菜单
            selAll('.el-cascader-menu')[2]
                .querySelector('.el-cascader-menu__item').click();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // 虽然存在弹出框，但是是隐藏状态
                    expect(sel('.el-cascader-menus')).to.be.exist;

                    expect(vm.selectedOptions.length).to.equal(3);
                    expect(vm.selectedOptions).have.ordered
                        .members(['zhejiang', 'hangzhou', 'xihu']);
                    expect(sel('.el-cascader__label').innerHTML).to.not.equal('');
                    // 检查是否存在动画， 动画结束后， 菜单隐藏
                    let className = sel('.el-cascader-menus').className;
                    expect(className).to.include('zoom');
                    resolve();
                });
            });
        }).then(() => {
            // 显示清空icon并点击清空
            expect(sel('.el-icon-circle-close')).to.not.be.exist;
            triggerEvent(document.querySelector('.el-cascader'), 'mouseenter');
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let closeIcon = sel('.el-icon-circle-close');
                    expect(closeIcon).to.be.exist;
                    closeIcon.click();
                    setTimeout(() => {
                        expect(vm.selectedOptions.length).to.equal(0);
                        expect(sel('.el-cascader__label').innerHTML).to.equal('');
                        resolve();
                    });
                });
            });
        }).then(() => {
            done();
        });

    });

    // 单选且能够选择所有级别节点
    it('basic-all-levels', done => {
        vm = createDemo({
            changeOnSelect: true,
            expandTrigger: 'hover'
        });
        expect(vm.$el).to.be.exist;
        let cascader = sel('.el-cascader');
        expect(cascader).to.be.exist;
        new Promise((resolve, reject) => {
            cascader.click();
            setTimeout(() => {
                resolve();
            });
        }).then(() => {
            // 选择一级目录 由于有子节点， 因而目录不会消失
            sel('.el-cascader-menu__item').click();

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let className = sel('.el-cascader-menus').className;
                    // 没有处于离开动画 但是此时有zoom in动画 ，所以不能靠zoom判断
                    expect(className).to.not.include('leave');
                    expect(vm.selectedOptions.length).to.equal(1);
                    expect(vm.selectedOptions).have.ordered
                        .members(['zhejiang']);
                    resolve();
                });
            });
        }).then(() => {
            let menus = selAll('.el-cascader-menu');
            expect(menus.length).to.equal(2);
            menus[1].querySelector('.el-cascader-menu__item').click();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let className = sel('.el-cascader-menus').className;
                    // 没有处于离开动画 但是此时有zoom in动画 ，所以不能靠zoom判断
                    expect(className).to.not.include('leave');
                    expect(vm.selectedOptions.length).to.equal(2);
                    expect(vm.selectedOptions).have.ordered
                        .members(['zhejiang', 'hangzhou']);
                    resolve();
                });
            });
        }).then(() => {
            let menus = selAll('.el-cascader-menu');
            expect(menus.length).to.equal(3);
            menus[2].querySelector('.el-cascader-menu__item').click();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let className = sel('.el-cascader-menus').className;
                    // 处于离开动画 但是此时有zoom in动画 ，所以不能靠zoom判断
                    expect(className).to.include('leave');
                    expect(vm.selectedOptions.length).to.equal(3);
                    expect(vm.selectedOptions).have.ordered
                        .members(['zhejiang', 'hangzhou', 'xihu']);
                    resolve();
                });
            });
        }).then(() => {
            done();
        });
    });

    // 多选
    it('multiple-select', done => {
        vm = createDemo({
            multiple: true
        });
        expect(vm.$el).to.be.exist;
        new Promise(resolve => {
            sel('.el-cascader').click(); // 展开一级菜单
            setTimeout(() => {
                let menus = selAll('.el-cascader-menu');
                expect(menus.length).to.equal(1);
                resolve();
            });
        }).then(() => {
            return new Promise(resolve => {
                let item = sel('.el-cascader-menu__item');
                expect(item).to.be.exist;
                item.click(); // 展开二级菜单
                setTimeout(() => {
                    expect(vm.selectedOptions.length).to.equal(0);
                    let menus = selAll('.el-cascader-menu');
                    expect(menus.length).to.equal(2);
                    resolve(menus);
                });
            });
        }).then((menus) => {
            return new Promise(resolve => {
                let menuItem = menus[1].querySelector('.el-cascader-menu__item');
                expect(menuItem).to.be.exist;
                menuItem.click(); // 展开三级菜单
                setTimeout(() => {
                    expect(vm.selectedOptions.length).to.equal(0);
                    resolve();
                });
            });
        }).then(() => {
            return new Promise(resolve => {
                selAll('.el-cascader-menu')[2] // 点击三级菜单
                    .querySelector('.el-cascader-menu__item').click();
                setTimeout(() => {
                    // 没有处于离开动画 但是此时有zoom in动画 ，所以不能靠zoom判断
                    let className = sel('.el-cascader-menus').className;
                    expect(className).to.not.include('leave');
                    expect(vm.selectedOptions.length).to.equal(1);
                    expect(vm.selectedOptions[0]).have.ordered
                        .members(['zhejiang', 'hangzhou', 'xihu']);
                    resolve();
                });
            });
        }).then(() => {
            let menus = selAll('.el-cascader-menu');
            expect(menus.length).to.equal(3);
            let secondaryItems = menus[1].querySelectorAll('.el-cascader-menu__item');
            expect(secondaryItems.length).to.equal(2);
            secondaryItems[1].click(); // 重新选择二级菜单
            return new Promise(resolve => {
                setTimeout(() => {
                    let menus = selAll('.el-cascader-menu');
                    expect(menus.length).to.equal(3);
                    selAll('.el-cascader-menu')[2] // 展开三级菜单
                        .querySelector('.el-cascader-menu__item').click();
                    setTimeout(() => {
                        let className = sel('.el-cascader-menus').className;
                        expect(className).to.not.include('leave');
                        expect(vm.selectedOptions.length).to.equal(2);
                        expect(vm.selectedOptions[1]).have.ordered
                            .members(['zhejiang', 'ningbo', 'jiangbei']);
                        resolve();
                    });
                });
            });
        }).then(() => {
            done();
        });
    });

    // 多选并且多级可选
    it('multiple-select-all-levels', done => {
        vm = createDemo({
            multiple: true,
            changeOnSelect: true,
            expandTrigger: 'hover'
        });
        expect(vm.$el).to.be.exist;
        new Promise(resolve => {
            sel('.el-cascader').click(); // 展开一级菜单
            setTimeout(() => {
                let menus = selAll('.el-cascader-menu');
                expect(menus.length).to.equal(1);
                resolve();
            });
        }).then(() => {
            return new Promise(resolve => {
                let item = sel('.el-cascader-menu__item');
                expect(item).to.be.exist;
                item.click(); // 选中一级菜单
                triggerEvent(item, 'mouseenter'); // 展开二级菜单
                setTimeout(() => {
                    expect(vm.selectedOptions.length).to.equal(1);
                    expect(vm.selectedOptions[0]).have.members(['zhejiang']);
                    let menus = selAll('.el-cascader-menu');
                    expect(menus.length).to.equal(2);
                    resolve(menus);
                });
            });
        }).then((menus) => {
            return new Promise(resolve => {
                let menuItem = menus[1].querySelector('.el-cascader-menu__item');
                expect(menuItem).to.be.exist;
                menuItem.click(); // 选中二级菜单
                triggerEvent(menuItem, 'mouseenter'); // 展开三级菜单
                setTimeout(() => {
                    expect(vm.selectedOptions.length).to.equal(2);
                    expect(vm.selectedOptions[1]).have.ordered
                        .members(['zhejiang', 'hangzhou']);
                    menus = selAll('.el-cascader-menu');
                    expect(menus.length).to.equal(3);
                    resolve(menus);
                });
            });
        }).then((menus) => {
            return new Promise(resolve => {
                // 选中三级菜单
                menus[2].querySelector('.el-cascader-menu__item').click();
                setTimeout(() => {
                    // 没有处于离开动画 但是此时有zoom in动画 ，所以不能靠zoom判断
                    let className = sel('.el-cascader-menus').className;
                    expect(className).to.not.include('leave');
                    expect(vm.selectedOptions.length).to.equal(3);
                    expect(vm.selectedOptions[2]).have.ordered
                        .members(['zhejiang', 'hangzhou', 'xihu']);
                    resolve();
                });
            });
        }).then(() => {
            let menus = selAll('.el-cascader-menu');
            expect(menus.length).to.equal(3);
            let secondaryItems = menus[1].querySelectorAll('.el-cascader-menu__item');
            expect(secondaryItems.length).to.equal(2);
            // 重新选择二级菜单并展开三级菜单
            triggerEvent(secondaryItems[1], 'mouseenter');
            return new Promise(resolve => {
                setTimeout(() => {
                    let menus = selAll('.el-cascader-menu');
                    expect(menus.length).to.equal(3);
                    selAll('.el-cascader-menu')[2] // 选中三级菜单
                        .querySelector('.el-cascader-menu__item').click();
                    setTimeout(() => {
                        let className = sel('.el-cascader-menus').className;
                        expect(className).to.not.include('leave');
                        expect(vm.selectedOptions.length).to.equal(4);
                        expect(vm.selectedOptions[3]).have.ordered
                            .members(['zhejiang', 'ningbo', 'jiangbei']);
                        resolve();
                    });
                });
            });
        }).then(() => {
            done();
        });
    });
});

function createDemo(options = {}) {
    return createVue({
        template: `
                <el-cascader-modified
                ref="cascader"
                placeholder="请选择"
                :options="options"
                :change-on-select="changeOnSelect"
                :expand-trigger="expandTrigger"
                :multiple="multiple"
                clearable
                v-model="selectedOptions"
                ></el-cascader-modified>
            `,
        data() {
            return {
                changeOnSelect: options.changeOnSelect || false,
                expandTrigger: options.expandTrigger || 'click',
                multiple: options.multiple || false,
                options: [{
                    value: 'zhejiang',
                    label: 'Zhejiang',
                    children: [{
                        value: 'hangzhou',
                        label: 'Hangzhou',
                        children: [{
                            value: 'xihu',
                            label: 'West Lake'
                        }]
                    }, {
                        value: 'ningbo',
                        label: 'NingBo',
                        children: [{
                            value: 'jiangbei',
                            label: 'Jiang Bei'
                        }]
                    }]
                }, {
                    value: 'jiangsu',
                    label: 'Jiangsu',
                    children: [{
                        value: 'nanjing',
                        label: 'Nanjing',
                        children: [{
                            value: 'zhonghuamen',
                            label: 'Zhong Hua Men'
                        }]
                    }]
                }],
                selectedOptions: []
            };
        }
    }, true);
}
