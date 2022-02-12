# resume
个人简历在线生成

[点击体验](https://resume.sugarat.top)

## 推荐阅读：[如何书写一份好的互联网校招简历](https://juejin.cn/post/6928390537946857479)

## 后续规划
* [ ] 接入markdown编辑(正在设计JSON与MD的友好互转方案)
* 网上优秀模板样式导入
  * [ ] [木及简历](https://resume.mdedit.online/#/) 
  * [ ] [Yang03/online-resume-generator](https://yang03.github.io/online-resume-generator/dist/index.html)
  * ....更多欢迎推荐自己喜欢的模板
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
npm i -g pnpm

pnpm install
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

简历模板实现部分与项目整体是低耦合的，所以理论上支持任意前端技术栈编写简历：
* html/css/js
* vue
* react
* jQuery
* ...更多

转到详细[贡献指南](./contribution.md)

## 已有模板展示

<img src="https://img.cdn.sugarat.top/mdImg/MTYxMzMwMzg4MDcyMQ==613303880721"/>
<img src="https://img.cdn.sugarat.top/mdImg/MTYxNDQ5MDQ1NzczOQ==614490457739"/>
<img src="https://img.cdn.sugarat.top/mdImg/MTYxNDQ5MDU1MDIzMw==614490550233"/>
