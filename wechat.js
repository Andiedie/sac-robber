const Wechat = require('wechat4u');
const fs = require('fs');
const config = require('./config');

let bot;
let roomId;
let myId;
let lastMsgId;

try {
  bot = new Wechat(require('./data.json'));
} catch (e) {
  bot = new Wechat();
}

if (bot.PROP.uin) {
  bot.restart();
} else {
  bot.start();
}

bot.on('uuid', uuid => {
  const qrcode = require('qrcode-terminal');
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid);
});

bot.on('login', () => {
  console.log('登录成功');
  fs.writeFileSync('./data.json', JSON.stringify(bot.botData));
});

bot.on('logout', () => {
  console.log('已登出');
  try {
    fs.unlinkSync('./data.json');
  } catch (e) {}
  bot = new Wechat();
});

bot.on('contacts-updated', contacts => {
  for (const one of contacts) {
    if (one.NickName && one.NickName.includes(config.roomName) && roomId !== one.UserName) {
      roomId = one.UserName;
      console.log('更新群ID为：', roomId);
    }
    if (one.NickName === config.myName && myId !== one.UserName) {
      myId = one.UserName;
      console.log('更新自身ID为：', myId);
    }
  }
});

bot.on('error', err => {
  console.error(err.message);
});

bot.setPollingTargetGetter(() => 60000);

exports.onMsg = fn => {
  bot.on('message', (msg) => {
    msg.IsMe = () => msg.FromUserName === myId;
    msg.IsTargetRoom = () => msg.FromUserName === roomId;
    fn(msg);
  });
};

exports.sendToMe = async what => {
  return send(what, myId);
};

exports.sendToRoom = async what => {
  return send(what, roomId);
};

exports.forwardMsgToRoom = async what => {
  try {
    let res = await bot.forwardMsg(what, roomId);
    lastMsgId = res.MsgID;
  } catch (err) {
    bot.emit('error', err);
  }
};

exports.revokeLastAtRoom = async () => {
  try {
    return bot.revokeMsg(lastMsgId, roomId);
  } catch (err) {
    bot.emit('error', err);
  }
};

exports.CONF = bot.CONF;

async function send (what, who) {
  try {
    let res = await bot.sendMsg(what, who);
    if (who === roomId) {
      lastMsgId = res.MsgID;
    }
  } catch (err) {
    bot.emit('error', err);
  }
}
