// 演示数据单测（require 即 100% 覆盖，校验数据契约不被改坏）
const m = require('../utils/mock.js');

describe('mock 数据契约', () => {
  test('核心列表长度符合预期', () => {
    expect(Array.isArray(m.products)).toBe(true);
    expect(m.products).toHaveLength(6);
    expect(m.tours).toHaveLength(3);
    expect(m.healings).toHaveLength(3);
    expect(m.feed).toHaveLength(10);
    expect(m.videos).toHaveLength(6);
    expect(m.meritBoard).toHaveLength(10);
    expect(m.meritGroups).toHaveLength(3);
    expect(m.wishWall).toHaveLength(4);
    expect(m.myBonds).toHaveLength(3);
    expect(m.following).toHaveLength(4);
    expect(m.followingFeed).toHaveLength(5);
    expect(m.profileNotes).toHaveLength(6);
    expect(m.cityLights).toHaveLength(5);
  });

  test('星图 demo 结构', () => {
    expect(m.palaza.mainStars).toHaveLength(6);
    expect(m.palaza.palaces).toHaveLength(12);
  });

  test('笔记可按 id 取且数量一致', () => {
    expect(Object.keys(m.notes)).toHaveLength(8);
    expect(m.notes[101].title).toBeTruthy();
    expect(m.notes[108].title).toBeTruthy();
  });

  test('功德榜单末位为「我」', () => {
    const me = m.meritBoard[m.meritBoard.length - 1];
    expect(me.me).toBe(true);
    expect(me.name).toBe('你');
  });

  test('feed / 视频条目含跳转与图标字段', () => {
    m.feed.forEach((f) => {
      expect(f).toHaveProperty('id');
      expect(f).toHaveProperty('noteId');
      expect(f).toHaveProperty('icon');
    });
    m.videos.forEach((v) => {
      expect(v).toHaveProperty('cover');
      expect(v).toHaveProperty('dur');
    });
  });

  test('消息中心结构', () => {
    expect(m.messages.sessions).toHaveLength(3);
    expect(m.messages.notices).toHaveLength(3);
    expect(m.messages.meritFeed).toHaveLength(3);
  });
});
