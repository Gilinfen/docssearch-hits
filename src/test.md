# Electron 基础教程

## [Electron](https://electronjs.org)是什么 ?

> 官方给出的解释：使用 JavaScript, HTML 和 CSS 构建跨平台的桌面应用。讲的再通俗一点就是 node + **Chromium(没有自带功能的 chrome)** + 前端三巨头组成的**开发工具**。

![electron](https://picgo-any.oss-cn-shanghai.aliyuncs.com/img/202301301900315.png "electron")
<small>图片非原创，取自网络</small>

## 为什么要用 Electron?

> 官网： Electron 是一个使用 JavaScript, HTML 和 CSS 等 Web 技术创建原生程序的框架，它负责比较难搞的部分，你只需把精力放在你的应用的**核心**上即可。 对我们来说 Electron 的核心就是我们的表现层（HTML + CSS + Javascript）。 最重要的一点：**前端工程师可以直接进入 GUI 开发领域** 所有的调试就可以有 pc 网站一样的体验,而且无视任何兼容性问题，只需要针对 chrome 开发。

## Electron 入门

> Electron 入门非常的简单，就算你从来没有过任何客户端开发的经验。只要你会用 NPM，会前端，都可以非常快速的新建一个 ELectron,[教程传送门](https://electron.org.cn/demo.html)。

![electron](https://picgo-any.oss-cn-shanghai.aliyuncs.com/img/202301301900738.png "electron")

## Electron-React

模版

-   [electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate) --------- [文档](https://electron-react-boilerplate.js.org/docs/installation)

## Electron-vue

模版

-   [vite-electron-builder](https://github.com/cawa-93/vite-electron-builder)

> 这是一个基于 Electron + Vue 的框架，他的作用是其实是让我们能够用 vue 去开发前端部分。我们自己就省去了框架融合的这一部分，起步也很简单。

如果是在 windows 的环境下，还需要注意一下这些**问题**

-   node-gyp 错误：这个一般是系统上的构建工具(Python,VisualStudio)的问题，我建议 windows 用户都安装一下这个东西。
-   npm 版本问题：保证 npm 一定要是最新的版本，推荐使用 yarn
-   构建工具打包处理：windows-build-tools 来为我们完成大部分烦人的工作。全局安装此工具将依次设置 Visual C++ 软件包、Python 等等。
    该弄的都弄完了，就可以敲代码了

```bash
# 安装 vue-cli 和 脚手架样板代码
npm install -g vue-cli
vue init simulatedgreg/electron-vue my-project

# 安装依赖并运行你的程序
cd my-project
yarn # 或者 npm install
yarn run dev # 或者 npm run dev
```

## Electron 进程

> Electron 分为两个进程。一个是主进程，一个是渲染进程。主进程主要负责的是 GUI 部分的构建。渲染进程就是负责页面显示部分的构建了。

### 主进程

使用 BrowserWindow 实例创建页面。 每个 BrowserWindow 实例都在自己的渲染进程里运行页面。 当一个 BrowserWindow 实例被销毁后，相应的渲染进程也会被终止。所谓的主进程在程序中直接的表现就是我们的入口文件，启动程序的时候首先在 package.json 中找到入口文件的地址

```bash
{
  "main": "./dist/electron/main.js",
}
```

然后执行具体的代码,主进程主要是负责调用沙盒环境内也就是计算机或者是 Node 层面的东西

```js
var app = require("app"); // 控制应用生命周期的模块。
var BrowserWindow = require("browser-window"); // 创建原生浏览器窗口的模块
// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window 会被自动地关闭
var mainWindow = null;
// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on("ready", function () {
    // 创建浏览器窗口。
    mainWindow = new BrowserWindow({
        useContentSize: true,
        height: 768,
        minHeight: 600,
        width: 1360,
        minWidth: 1365,
        show: false, //
        frame: false, // 无边框桌面
    });
    // 加载html
    mainWindow.loadURL("file://" + __dirname + "/index.html");
});
```

这样就创建了一个 electron 程序

### 渲染进程

> 主进程管理所有的 web 页面和它们对应的渲染进程。 每个渲染进程都是独立的，它只关心它所运行的 web 页面。渲染进程没什么可讲的

## 主进程和渲染进程的**通讯**

> 在任何一个框架或者语言中通信都是相对重要的部分。ELectron 也不例外

-   进程间共享数据：在主程序和渲染程序中都可以使用得数据。
    Electron 提供 IPC 系统共享数据

```js
// 在主进程里
global.sharedObject = {
    someProperty: "default value",
};

// In page 1.
require("remote").getGlobal("sharedObject").someProperty = "new value";
// In page 2.
console.log(require("remote").getGlobal("sharedObject").someProperty);
```

-   不同页面间共享数据: Storage IndexDB 都可以

-   Electron 的通信: 主要是通过发布/监听的模式来实现的，和 vue 中父子组件通信的 emit 和 on 有点类似

**[ipcMain](https://electronjs.org/docs/api/ipc-main)**: ipcMain 模块是 EventEmitter 类的一个实例。 当在主进程中使用时，它处理从渲染器进程（网页）发送出来的异步和同步信息。 从渲染器进程发送的消息将被发送到该模块。

发送消息时，事件名称为 channel。

回复同步信息时，需要设置 event.returnValue。

将异步消息发送回发件人，需要使用 event.sender.send(...)。

```js
// 在主进程中.
const { ipcMain } = require("electron");
ipcMain.on("asynchronous-message", (event, arg) => {
    console.log(arg); // prints "ping"
    event.sender.send("asynchronous-reply", "pong");
});

ipcMain.on("synchronous-message", (event, arg) => {
    console.log(arg); // prints "ping"
    event.returnValue = "pong";
});
```

**[ipcRender](https://electronjs.org/docs/api/ipc-renderer)**：ipcRenderer 是一个 EventEmitter 的实例。 你可以使用它提供的一些方法从渲染进程 (web 页面) 发送同步或异步的消息到主进程。 也可以接收主进程回复的消息。 这个是在渲染进程中使用得通信模块

```js
// 主进程中监听事件 'maximize'
mainWindow.on("maximize", (event, arg) => {
    event.sender.send("maxPage", "max");
});
//在渲染器进程 (网页) 中。
const { ipcRenderer } = require("electron");
ipcRenderer.send("maximize");
```

## 在 Electron 中使用 Node.js

> Electron 同样也支持 Node 原生模块，但由于和官方的 Node 相比使用了不同的 V8 引擎，如果你想编译原生模块，则需要手动设置 Electron 的 headers 的位置。 这一步配置好环境之后一般没什么大问题

有三种方法去安装原生模块

1. **通过 npm 安装**
   只要设置一些系统环境变量，你就可以通过 npm 直接安装原生模块。
   为 Electron 安装所有依赖项:

```bash
# Electron 的版本。
export npm_config_target=1.2.3
# Electron 的系统架构, 值为 ia32 或者 x64。
export npm_config_arch=x64
export npm_config_target_arch=x64
# 下载 Electron 的 headers。
export npm_config_disturl=https://atom.io/download/electron
# 告诉 node-pre-gyp 是为 Electron 构建。
export npm_config_runtime=electron
# 告诉 node-pre-gyp 从源代码构建模块。
export npm_config_build_from_source=true
# 下载所有依赖，并缓存到 ~/.electron-gyp。
HOME=~/.electron-gyp npm install
```

2. **为 Electron 安装并重新编译模块**
   你可以也选择安装其他 Node 项目模块一样，然后用 electron-rebuild 包重建 Electron 模块 。 它可以识别当前 Electron 版本，帮你自动完成了下载 headers、编译原生模块等步骤。

```bash
npm install --save-dev electron-rebuild

# 每次运行"npm install"时，也运行这条命令
./node_modules/.bin/electron-rebuild

# 在windows下如果上述命令遇到了问题，尝试这个：
.\node_modules\.bin\electron-rebuild.cmd
```

3. **为 Electron 手动编译**
   如果你是一个原生模块的开发人员，想在 Electron 中进行测试， 你可能要手动编译 Electron 模块。 你可以 使用 `node-gyp` 直接编译：

```bash
cd /path-to-module/
HOME=~/.electron-gyp node-gyp rebuild --target=1.2.3 --arch=x64 --dist-url=https://atom.io/download/electron
```

## Electron 打包

> 做程序打包时比较重要的一个部分目前比较流行的打包库：Electron-packager Electron-builder 我们用的时 Electron-builder 今天主要来讲 Electron-builder

相对于 packager builder 更简单 API 更加友好 而且 builder 可以直接生成安装包，builder 中生成的是已经编译完的代码

下面给出来一个最简单的例子(package.json 简单配置)

```bash
yarn add electron-builder --dev
```

```bash

"scripts": {
    "builder": "electron-builder"// 简单打包命令
},
"build": {
    "appId": "com.leon.HelloWorld02",//包名
    "copyright":"LEON",//版权
    "productName":"HelloWorld02",//项目名
    "dmg":{  // mac打包选项
      "background":"res/background.png",//背景图片路径
      "window":{
        //窗口左上角起始坐标
        "x":100,
        "y":100,
        //窗口大小
        "width":500,
        "height":300
      }
    },
    "files": [ // 需要打包的文件
      "dist/electron/**/*"
    ],
    "win": {
        "icon": "res/icon.ico",//图标路径
        "target": [ // 构建目标
          "nsis", // 这个指的就是安装包
          "zip" // 这个是压缩包
        ]
    }
  }

```

:::warning
注意：在程序打包得这一项中复杂得地方不在代码，是在我们环境的配置中，有一部分的包我们要科学上网之后才能下载，例如 nsis-resources-3.3.0：翻墙后下载两次才成功，这个过程中一定耐性

:::

这里有一个更加详细的[教程](/page/Electron/1-base/1-electron-builder.md)

## 程序更新

> 在 Electron 的整个开发中，程序的更新可能是相对麻烦点的一部分
> 目前 Electron 程序的更新方式还是很开放的

1. 替换 html 文件更新，这个比较节约资源，但是并不适用我们用 builder 打包出来的程序
2. 替换 asar 文件,这个比较小众
3. electron-builder + electron-updater 实现全量更新，我们主要讲一讲这个部分。**这个更新的机制按照我的理解是生成一个新的安装包然后和一个 last.yml 配置文件，触发更新事件之后读取线上的包的配置文件，然后比对当当前程序中的程序的版本号，然后再选择更新不更新。**

-   electron-builder 配置模块

    这个配置主要是在打包前在*package.json*中配置

    ```bash
    "build": {
        "productName": "项目名",
        "appId": "org.simulatedgreg.xxx.xxx-exe", // appID
        "directories": {
          "output": "build"
        },
        "publish": [ // 这个配置会生成latest.yml文件，用于自动更新的配置信息；
          {
            "provider": "generic",
            "url": "http://appupdate.xxx.xxx.cn/" // 更新地址 这个很重要
          }
        ]
      },
    ```

-   代码模块

    主进程中代码

    ```js
    // 注意这个autoUpdater不是electron中的autoUpdater
    import { autoUpdater } from "electron-updater";
    import config from "../renderer/config/index";
    const uploadUrl =
        process.env.NODE_ENV === "development"
            ? config.dev.env.UPLOAD_URL
            : config.build.env.UPLOAD_URL;
    // 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
    function updateHandle() {
        let message = {
            appName: "XXXX",
            error: {
                key: "0", //更新出错
                msg: "更新出错",
            },
            checking: {
                key: "1", //检查更新中
                msg: "检查更新中...",
            },
            updateAva: {
                key: "2", //更新可用
                msg: "有新版本可用",
            },
            updateNotAva: {
                key: "3", //已是最新版本
                msg: "已是最新版本",
            },
            updated: {
                key: "4", //安装包已下载完成
                msg: "安装包已下载完成",
            },
        };
        autoUpdater.setFeedURL(uploadUrl);
        autoUpdater.autoDownload = false; // 取消自动下载更新 如果不设置的话 发现新版本会自动进行下载 体验很不好
        autoUpdater.on("error", function (error) {
            sendUpdateMessage(message.error);
        });
        //当开始检查更新的时候触发
        autoUpdater.on("checking-for-update", function () {
            sendUpdateMessage(message.checking);
        });
        //当发现一个可用更新的时候触发，更新包下载会自动开始
        autoUpdater.on("update-available", function (info) {
            console.log(info.version);
            sendUpdateMessage(message.updateAva);
            return false;
        });
        //开始下载
        ipcMain.on("begin-download", (event, arg) => {
            console.log("begin download");
            autoUpdater.downloadUpdate();
        });
        //当没有可用更新的时候触发
        autoUpdater.on("update-not-available", function (info) {
            sendUpdateMessage(message.updateNotAva);
        });
        // 更新下载进度事件
        autoUpdater.on("download-progress", function (progressObj) {
            mainWindow.webContents.send("downloadProgress", progressObj);
        });
        /**
         *  event Event
         *  releaseNotes String - 新版本更新公告
         *  releaseName String - 新的版本号  在Windows中只有这个可用
         *  releaseDate Date - 新版本发布的日期
         *  updateURL String - 更新地址
         * */
        autoUpdater.on(
            "update-downloaded",
            function (
                event,
                releaseNotes,
                releaseName,
                releaseDate,
                updateUrl,
                quitAndUpdate
            ) {
                // 发送已存在安装包的信息
                mainWindow.webContents.send("downloaded", message.updated);
                // 离开并安装
                ipcMain.on("bengin-install", () => {
                    autoUpdater.quitAndInstall();
                });
            }
        );
        ipcMain.on("checkForUpdate", () => {
            //执行自动更新检查
            autoUpdater.checkForUpdates();
        });
    }
    // 通过main进程发送事件给renderer进程，提示更新信息
    function sendUpdateMessage(text) {
        mainWindow.webContents.send("update_msg", text);
    }
    ```

    然后在渲染进程中触发事件，再多次进行通信就可以完成

    整个的过程如下图

    ![update](https://picgo-any.oss-cn-shanghai.aliyuncs.com/img/202301301927248.png)

## 总结

> 上面讲的那些只是 ELectron 的冰山一角，还有很多的模块等着我们去探索和发现。前路漫漫，共同努力。
