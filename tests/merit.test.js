// 单元测试：功德等级计算（纯函数，无需 wx）
const { levelOf } = require('../utils/merit.js');

describe('merit.levelOf 等级阶梯', () => {
  test('0 功德为善信 Lv.1，进度 0', () => {
    const r = levelOf(0);
    expect(r.name).toBe('善信');
    expect(r.lv).toBe(1);
    expect(r.progress).toBe(0);
    expect(r.toNext).toBe(50);
  });

  test('49 功德仍为善信，进度 98%、距下一级 1', () => {
    const r = levelOf(49);
    expect(r.name).toBe('善信');
    expect(r.toNext).toBe(1);
    expect(r.progress).toBe(98);
  });

  test('50 功德升清信士 Lv.2', () => {
    const r = levelOf(50);
    expect(r.name).toBe('清信士');
    expect(r.lv).toBe(2);
  });

  test('150 功德升居士，距修士 250', () => {
    const r = levelOf(150);
    expect(r.name).toBe('居士');
    expect(r.toNext).toBe(250); // 400 - 150
  });

  test('超上限跳到最高大德，无下一级，进度 100', () => {
    const r = levelOf(5000);
    expect(r.name).toBe('大德');
    expect(r.next).toBeNull();
    expect(r.progress).toBe(100);
  });

  test('边界：399 仍为居士，400 升修士', () => {
    expect(levelOf(399).name).toBe('居士');
    expect(levelOf(400).name).toBe('修士');
  });
  test('边界：899 仍为修士，900 升行者', () => {
    expect(levelOf(899).name).toBe('修士');
    expect(levelOf(900).name).toBe('行者');
  });
});
