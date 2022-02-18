# protoc-gen-dotbpe2
基于nodejs的 Google Protobuf 代码生成工具，用于生成DotBPE V2的样板代码，


## 安装
请保证本机有nodejs 运行环境，使用以下代码安装

```
npm install -g protoc-gen-dotbpe2

```


## 使用

在 window 下需要指定 --plugin 的 完整路径，因为windows下，插件要么指定，要么默认是exe格式，注册在path中

```
protoc --plugin=protoc-gen-dotbpe2=PATH TO **protoc-gen-dotbpe** --dotbpe2_out=generated yourfile.proto

```

在 mac 下可以不指定 --plugin ，直接使用

```
protoc --dotbpe2_out=generated yourfile.proto

```

## windows下的最佳使用方式
在windows中 实际使用是建议在项目中建快捷方式的cmd，然后--plugin 指向项目目录的cmd即可

`dotbpe-amp-link.cmd`

```
@echo off
protoc-gen-dotbpe2 %*

```

然后使用


```
protoc --plugin=protoc-gen-dotbpe2=dotbpe-amp-link.cmd --dotbpe2_out=generated yourfile.proto

```


## 反馈

有任何问题可通过  Issues  反馈
