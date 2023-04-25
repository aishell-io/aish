aish - A ChatGPT CLI
====================

English | [简体中文](./docs/README.zh_CN.md)

![gif](./docs/images/browse-copy.gif)

aish is a ChatGPT CLI with local storage that allows users to use ChatGPT in a simple and efficient way. It is conveniently integrated with other CLI commands, due to its capability to read from stdio.


# Features

- Local storage for dialog messages.
- Read from stdio as prompt if no argument.
- Chat in topic.

# Installation

Download from the [releases](https://github.com/aishell-io/aish/releases). Choose the proper distribution for your operation system.

## Windows

Run the installer.

<img width="371" alt="win32" src="https://user-images.githubusercontent.com/1261891/231702837-d4b84ee3-a9fb-4444-ba35-156593fca1cb.png">


## MacOS

Run the installer.

![mac](https://user-images.githubusercontent.com/1261891/231704601-cfbb2a12-2188-4363-ae28-d624823547f6.png)


## Debian/Ubuntu

Use apt install:

    sudo apt install ./aish_0.0.4_Debian_Ubuntu_amd64.deb

# Usage

Use *config* command to set up your key:

    aish config key

Then you can start chat now. There are 2 ways to conversation with ChatGPT:

## 1. Input prompt as the command argument:

    $ aish "What are the best 3D softwares?"
    As an AI language model, I don't have personal preferences but I can suggest some popular 3D softwares for you:

    1. Autodesk Maya: Widely used in the film and video game industry, Maya is known for its advanced animation and modeling tools.

    2. Blender: One of the best free 3D modeling software available, Blender is great for creating complex models and animations.

    3. 3ds Max: Another Autodesk product, 3ds Max is often used for architectural visualization, product design, and gaming industries.

This way supports input prompt via stdio.

## 2. Interactive conversation

You can also use the interactive conversation mode with *start* command:

    $ aish start

    Hello from ChatGPT-3.5-turbo!
    Let's start a chat.😊
    
    > How are you
    I'm an AI language model, so I don't have feelings like humans. But I am functioning well and ready to assist you with any task. How can I help you today?
    
    
    > Where is Japan?
    Japan is an island nation located in East Asia, in the Pacific Ocean. It is bordered by the Sea of Japan to the west and the Pacific Ocean to the east. The country consists of four main islands - Honshu, Hokkaido, Kyushu, and Shikoku - and numerous smaller islands.

## Topic

By default, ChatGPT has the capability to recognize the contextual meaning of conversations. However, when the context goes beyond a predefined threshold, a new topic will be initiated, leading to the loss of previous context.

To force a new topic any time, issue the command:

    aish topic new

## Browse mode

Input b to enter the browser mode. Then you can use Up/Down arrow key or k/j to browse the chat history.

## Copy

During the chat, you can use the c command to copy the last response from ChatGPT to clipboard.

