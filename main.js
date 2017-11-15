const Wechat = require('wechat4u');
const fs = require('fs');
const config = require('./config');
config.rob = process.argv[2] === 'rob' ? true : config.rob;
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
    if (one.NickName === config.groupName && roomId !== one.UserName) {
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

bot.on('message', msg => {
  if (msg.FromUserName === roomId && msg.MsgType === bot.CONF.MSGTYPE_TEXT) {
    const isShuaiBan = /\n.{0,2}甩.*第[一二三四五12345]班?$/.test(msg.Content);
    if (isShuaiBan) {
      if (config.rob) {
        bot.sendMsg(config.jie[Math.floor(Math.random() * config.jie.length)], roomId)
          .then(res => {
            return bot.sendMsg(msg.Content, myId);
          })
          .catch(err => {
            bot.emit('error', err);
          });
      } else {
        bot.sendMsg(msg.Content, myId)
          .catch(err => {
            bot.emit('error', err);
          });
      }
    }
  }
});
