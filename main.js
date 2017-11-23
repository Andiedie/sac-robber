const Wechat = require('wechat4u');
const fs = require('fs');
const config = require('./config');
config.rob = process.argv[2] === 'rob' ? true : config.rob;
console.log(config.rob ? '启动抢班' : '关闭抢班');
let bot;

let roomId;
let myId;

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
    if (one.NickName === config.roomName && roomId !== one.UserName) {
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
  console.error(`${new Date()}错误：${err.message}`);
});

bot.on('message', async msg => {
  if (msg.FromUserName === roomId) {
    if (msg.MsgType !== bot.CONF.MSGTYPE_TEXT) return;
    msg.Content = msg.Content.substr(msg.Content.indexOf('\n') + 1);
    msgFromGroup(msg);
  } else if (msg.FromUserName === myId) {
    msgFromMe(msg);
  }
});

async function msgFromGroup (msg) {
  for (let condition of config.include) {
    if (condition instanceof RegExp) {
      if (!condition.test(msg.Content)) {
        return;
      }
    } else if (typeof condition === 'string') {
      if (!msg.Content.includes(condition)) {
        return;
      }
    }
  }
  for (let condition of config.exclude) {
    if (condition instanceof RegExp) {
      if (condition.test(msg.Content)) {
        return;
      }
    } else if (typeof condition === 'string') {
      if (msg.Content.includes(condition)) {
        return;
      }
    }
  }
  if (config.rob) {
    const randomJie = config.jie[Math.floor(Math.random() * config.jie.length)];
    send(randomJie, roomId);
  }
  await informMe(msg.Content);
}

async function msgFromMe (msg) {
  switch (msg.Content) {
    case config.startRob:
      config.rob = true;
      await send('开启抢班', myId);
      console.log('开启抢班');
      break;
    case config.endRob:
      config.rob = false;
      send('关闭抢班', myId);
      console.log('关闭抢班');
      break;
    case config.startForward:
      config.forward = true;
      await send('开始转发', myId);
      console.log('开始转发');
      break;
    case config.endForward:
      config.forward = false;
      await send('停止转发', myId);
      console.log('停止转发');
      break;
    default:
      if (config.forward) {
        await forwardMsg(msg, roomId);
      }
  }
}

async function send (what, who) {
  try {
    await bot.sendMsg(what, who);
  } catch (err) {
    bot.emit('error', err);
  }
}

async function forwardMsg (what, who) {
  try {
    await bot.forwardMsg(what, who);
  } catch (err) {
    bot.emit('error', err);
  }
}

async function informMe (msg) {
  for (let i = 0; i < config.informTimes; i++) {
    await send(msg, myId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
