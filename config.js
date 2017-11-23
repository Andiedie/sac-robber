module.exports = {
  groupName: 'SAC_ 欢迎小鲜肉(｡･ω･｡)',
  myName: '节能君',
  include: [/.*第[一二三四五12345]班?$/],
  exclude: ['换'],
  // 接班语句集合
  jie: ['接', '接了', '接！', '接~', 'jie'],
  // 是否自动抢班
  rob: false,
  // 通知次数
  informTimes: 10,
  // 开启抢班的微信消息
  startRob: 's',
  // 关闭抢班的微信消息
  endRob: 'e'
};
