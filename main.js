const Wechat = require('wechat4u');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const config = require('./config');
let bot;

let roomId;
let myId;

try {
  bot = new Wechat(require('./sync-data.json'));
} catch (e) {
  bot = new Wechat();
}

if (bot.PROP.uin) {
  bot.restart();
} else {
  bot.start();
}

bot.on('uuid', uuid => {
  qrcode.generate('https://login.weixin.qq.com/l/' + uuid, {
    small: true
  });
});

bot.on('login', () => {
  console.log('登录成功');
  fs.writeFileSync('./sync-data.json', JSON.stringify(bot.botData));
});

bot.on('logout', () => {
  console.log('已登出');
  try {
    fs.unlinkSync('./sync-data.json');
  } catch (e) {}
});

bot.on('contacts-updated', contacts => {
  for (const one of contacts) {
    if (one.isRoomContact() && one.NickName === config.groupName && roomId !== one.UserName) {
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
  console.error('错误：', err.message);
});

bot.on('message', msg => {
  if (msg.FromUserName === roomId) {
    const isShuaiBan = /甩.*第[一二三四五12345]/.test(msg.Content);
    if (isShuaiBan) {
      bot.sendMsg(config.jie[Math.floor(Math.random() * config.jie.length)], roomId)
        .then(() => bot.sendMsg(msg.Content, myId))
        .catch(err => {
          bot.emit('error', err);
        });
    }
  }
});
