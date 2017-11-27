module.exports = {
  roomName: 'SAC_ 欢迎小鲜肉(｡･ω･｡)',
  myName: '节能君',
  include: [/甩.{0,3}第[一二三四五12345]班?$/],
  exclude: ['换'],
  // 接班语句集合
  jie: ['接', '接了', '接！', '接~', 'jie'],
  // 通知次数
  informTimes: 10,
  // 是否自动抢班
  rob: false,
  // 是否转发消息到群
  forward: false,
  // 开启或关闭功能的微信消息
  startRob: 'rob',
  endRob: 'no rob',
  startForward: 'forward',
  endForward: 'no forward',
  showStatus: 'status'
};
