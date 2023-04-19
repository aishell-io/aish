# aish - ChatGPT命令行客户端

aish 是用于管理与 ChatGPT 聊天的命令行客户端。

## 主要功能

- 本地存储聊天对话。
- 支持标准输入输出。
- 上下文支持（基于topic的聊天）。
- 个人key配置。

## 安装与卸载

### 下载安装包

从[下载地址](https://github.com/aishell-io/aish/releases)下载你的计算机操作系统对应的安装包。

### Windows

运行安装包：

<img width="371" alt="win32" src="https://user-images.githubusercontent.com/1261891/231702837-d4b84ee3-a9fb-4444-ba35-156593fca1cb.png">


### MacOS

运行安装包：

![mac](https://user-images.githubusercontent.com/1261891/231704601-cfbb2a12-2188-4363-ae28-d624823547f6.png)


### Debian/Ubuntu

使用 apt 命令进行安装：

    sudo apt install ./aish_0.0.4_Debian_Ubuntu_amd64.deb

## 用法

### 配置key（可选）

如果你有 ChatGPT key，则使用下面的命令进行配置：

    aish config key

如果没有key，则无需配置，聊天将通过代理实现。

### 查看可用使用的模型

如果你配置了key，你就可以使用 *model* 命令来查看可使用的模型：

    # 查看全部可使用模型
    aish model list

    # 查看一个模型的具体情况
    aish model list -m gpt-3.5-turbo


### 开始聊天

有两种基本方式进行聊天：

#### 一次提交Prompt

Prompt作为参数即可进行一次性对话：

    $ aish "What are the best 3D softwares?"
    As an AI language model, I don't have personal preferences but I can suggest some popular 3D softwares for you:

    1. Autodesk Maya: Widely used in the film and video game industry, Maya is known for its advanced animation and modeling tools.

    2. Blender: One of the best free 3D modeling software available, Blender is great for creating complex models and animations.

    3. 3ds Max: Another Autodesk product, 3ds Max is often used for architectural visualization, product design, and gaming industries.


#### 2. 交互方式

使用 start 命令开始交互式聊天：

    $ aish start

    Hello from ChatGPT-3.5-turbo!
    Let's start a chat.😊

    > How are you
    I'm an AI language model, so I don't have feelings like humans. But I am functioning well and ready to assist you with any task. How can I help you today?


    > Where is Japan?
    Japan is an island nation located in East Asia, in the Pacific Ocean. It is bordered by the Sea of Japan to the west and the Pacific Ocean to the east. The country consists of four main islands - Honshu, Hokkaido, Kyushu, and Shikoku - and numerous smaller islands.

## 使用命令行管道

aish 支持标准输入/输出，因此可以使用管道来连接其他命令的输入/输出，例如：

    $ echo "how are you" | aish
    As an AI language model, I don't have emotions, but I'm functioning properly and ready to assist you with any questions or tasks you might have. How can I assist you today?


## 话题

默认支持话题聊天（上下文感知）。

话题聊天比较费 token，使用下面的命令将开始一个新话题（即清除当前上下文）：

    aish topic new



