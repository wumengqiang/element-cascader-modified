// 本文件主要测试级联菜单的disabled属性

import { createVue,
    destroyVM,
    // triggerEvent,
    sel,
    selAll,
    removeEl} from '../utils/index.js';

describe('Cascader-modified disabled', () => {
    let vm;
    afterEach(() => {
        destroyVM(vm);
        removeEl('.el-cascader-menus');
    });
    // 单选情况、仅叶子节点可选、点击触发下一级菜单、对于叶子节点和非叶子节点的点击测试
    it('single select, expandTrigger:click, disabled, ', done => {
        vm = createDemo();
        expect(vm.$el).to.be.exist;
        expect(sel('.el-cascader')).to.be.exist;
        new Promise(resolve => { // 点击显示目录
            sel('.el-cascader').click();
            setTimeout(() => {
                expect(sel('.el-cascader-menus')).to.be.exist;
                resolve();
            });
        }).then(() => { // 点击disabled的一级菜单
            return new Promise(resolve => {
                let firstItem = sel('.el-cascader-menu__item');
                expect(firstItem).to.be.exist;
                firstItem.click();
                setTimeout(() => { // 验证并没有存进值并展开了目录
                    expect(vm.selectedOptions.length).to.equal(0);
                    let menus = selAll('.el-cascader-menu');
                    expect(menus.length).to.equal(2);
                    resolve(menus);
                });
            });
        }).then(menus => { // 点击二级菜单
            return new Promise(resolve => {
                let secondaryMenuItem = menus[1].querySelector('.el-cascader-menu__item');
                expect(secondaryMenuItem).to.be.exist;
                secondaryMenuItem.click();
                setTimeout(() => { // 验证并没有存进值并展开了目录
                    expect(vm.selectedOptions.length).to.equal(0);
                    let menus = selAll('.el-cascader-menu');
                    expect(menus.length).to.equal(3);
                    resolve(menus);
                });
            });
        }).then(menus => { // 点击三级菜单选项(disabled) 无效
            return new Promise(resolve => {
                let firstItem = menus[2]
                    .querySelector('.el-cascader-menu__item');
                expect(firstItem).to.be.exist;
                firstItem.click();
                setTimeout(() => {
                    expect(vm.selectedOptions.length).to.equal(0);
                    resolve(menus);
                });
            });
        }).then(menus => { // 点击三级菜单选项(非disabled) 有效
            return new Promise(resolve => {
                let secondItem = menus[2]
                    .querySelectorAll('.el-cascader-menu__item')[1];
                expect(secondItem).to.be.exist;
                secondItem.click();
                setTimeout(() => { // 值被选中 菜单关闭
                    let className = sel('.el-cascader-menus').className;
                    expect(className).to.include('leave');
                    expect(vm.selectedOptions.length).to.equal(3);
                    expect(vm.selectedOptions).have.ordered
                        .members(['zhejiang', 'hangzhou', 'lingyingsi']);
                    resolve();
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
                    disabled: true,
                    children: [{
                        value: 'hangzhou',
                        label: 'Hangzhou',
                        children: [{
                            value: 'xihu',
                            label: 'West Lake',
                            disabled: true,
                        }, {
                            value: 'lingyingsi',
                            label: 'lingyingsi'
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
