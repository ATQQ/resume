# resume
个人简历在线生成

[点击体验](https://resume.sugarat.top)

## 推荐阅读：[如何书写一份好的互联网校招简历](https://juejin.cn/post/6928390537946857479)

## 如何食用本仓库
1. clone仓库代码
```shell
git clone https://github.com/ATQQ/resume.git
```
```shell
cd resume
```
2. 安装依赖
```shell
npm install
```
3. 本地运行
```shell
npm run dev
```
4. 构建
```shell
npm run build
```

## 如何贡献你的模板
本仓库接入了Github Action，pr合并后会自动更新到[线上](https://resume.sugarat.top)

遵循约定优于配置的观点，贡献者只需关心简历部分的实现即可

简历实现部分与项目整体是低耦合的，所以支持任意前端技术栈：
* html/css/js
* vue
* react
* jQuery
* ...更多

### 目录介绍
贡献者只需要关心./src目录，对其它配置感兴趣可自行品鉴
```
./src
├── assets          静态资源css/img
├── constants       常量
│   ├── index.js    存放路径与中文title的映射
│   └── schema.js   存放每个简历模板的默认JSON数据
├── pages           简历模板
│   ├── demo1           - html/css/js编写的简历
│   ├── demo2           - vue编写的简历
│   ├── demo3           - react编写的简历
│   └── introduce       - 应用的使用文档
├── utils
├── app.js          项目的入口js
├── index.html      项目的入口页面
```
### 新增模板

### 待完善。。。
## 示例

点击[在线查看导出的简历](https://img.cdn.sugarat.top/resume/demo1.pdf)

![图片](https://img.cdn.sugarat.top/mdImg/MTYxMzMwMzg4MDcyMQ==613303880721)
