const wechat = require('./wechat');
const config = require('./config');

const level = [
  {
    include: [/甩.{0,3}第[一二三四五12345]/],
    exclude: ['换', '吗', '?', '？', '私戳', /周[一二三四五12345]第[一二三123]/, '请', '不', '昨天'],
    action: async msg => {
      if (config.rob) {
        const randomJie = config.jie[Math.floor(Math.random() * config.jie.length)];
        await wechat.sendToRoom(randomJie);
      }
      for (let i = 0; i < 5; i++) {
        await wechat.sendToMe(msg.Content);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },
  {
    include: [/第[一二三四五]/],
    exclude: ['换', '私戳', /周[一二三四五12345]第[一二三123]/, '昨天'],
    action: async msg => {
      await wechat.sendToMe(msg.Content);
    }
  }
];

wechat.onMsg(async msg => {
  if (msg.IsTargetRoom()) {
    if (msg.MsgType !== wechat.CONF.MSGTYPE_TEXT) return;
    msg.Content = msg.Content.substr(msg.Content.indexOf('\n') + 1);
    msgFromGroup(msg);
  } else if (msg.IsMe()) {
    msgFromMe(msg);
  }
});

async function msgFromGroup (msg) {
  let action;
  outer: for (const one of level) {
    for (let condition of one.include) {
      if (condition instanceof RegExp && !condition.test(msg.Content)) {
        continue outer;
      } else if (typeof condition === 'string' && !msg.Content.includes(condition)) {
        continue outer;
      }
    }
    for (let condition of one.exclude) {
      if (condition instanceof RegExp && condition.test(msg.Content)) {
        continue outer;
      } else if (typeof condition === 'string' && msg.Content.includes(condition)) {
        continue outer;
      }
    }
    action = one.action;
    break;
  }
  if (action) {
    action(msg);
  }
}

async function msgFromMe (msg) {
  switch (msg.Content) {
    case config.startRob:
      config.rob = true;
      await wechat.sendToMe('开启抢班');
      console.log('开启抢班');
      break;
    case config.endRob:
      config.rob = false;
      await wechat.sendToMe('关闭抢班');
      console.log('关闭抢班');
      break;
    case config.startForward:
      config.forward = true;
      await wechat.sendToMe('开始转发');
      console.log('开始转发');
      break;
    case config.endForward:
      config.forward = false;
      await wechat.sendToMe('停止转发');
      console.log('停止转发');
      break;
    case config.showStatus:
      await wechat.sendToMe(`rob: ${config.rob}\nforward: ${config.forward}`);
      break;
    case config.revoke:
      await wechat.revoke();
      break;
    default:
      if (config.forward) {
        wechat.forwardMsgToRoom(msg);
      }
  }
}
