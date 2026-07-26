// 云函数：genBlessingVideo
// 作用：接收小程序端传来的 模板/祝福文案/背景音乐，使用服务端 ffmpeg 合成为 MP4 视频。
// 部署：在微信开发者工具「云开发」中创建环境后，右键本目录「上传并部署」。
// 依赖：需在云函数目录 npm install 以下两个包（或使用 wx-server-sdk）。

const cloud = require('wx-server-sdk');
// 若用腾讯云 CloudBase 自建：const cloud = require('@cloudbase/node-sdk');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const { templateKey = 'birthday', text = '', music = '轻柔钢琴' } = event;
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bless-'));
  const bg = path.join(workDir, 'bg.png');      // 由模板渲染的背景图（实际可由 canvas 服务端库生成）
  const audio = path.join(workDir, 'bgm.mp3');  // 对应背景音乐文件
  const out = path.join(workDir, 'blessing.mp4');

  // 说明：真环境中应先生成背景图、准备好音频，再用 ffmpeg 合成。
  // 示意命令（需云函数运行环境已安装 ffmpeg）：
  const cmd = 'ffmpeg';
  const args = [
    '-loop', '1', '-i', bg,
    '-i', audio,
    '-c:v', 'libx264', '-t', '8', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-shortest',
    out
  ];

  return new Promise((resolve) => {
    execFile(cmd, args, async (err) => {
      if (err) {
        // MVP 阶段未安装 ffmpeg 时返回参数回显，便于前端本地导出图片兜底
        resolve({ ok: false, note: '请在云函数环境安装 ffmpeg 后合成视频', params: { templateKey, text, music } });
        return;
      }
      // 上传到云存储并返回可访问地址
      const res = await cloud.uploadFile({ cloudPath: `blessing/${Date.now()}.mp4`, fileContent: fs.readFileSync(out) });
      resolve({ ok: true, fileID: res.fileID });
    });
  });
};
