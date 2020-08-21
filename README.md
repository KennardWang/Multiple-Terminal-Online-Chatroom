# WeChatMiniProgram-OnlineChatRoom
### Demo
------
### Development Environment
|Description|Specification|
|:---:|:---:|
|System|**Windows 10 64bits**|
|Language|**HTML, CSS, Javascript**|
|IDE|**WeChat Developer Tools v1.03.2006090** for Applet, **VS Code** for Web|

------
### Functionality
+ User Function
  + WeChat Login & Authorization ( ***Applet Side, get users' avatar and nickname*** )
  + Email & Password Login ( ***Web Side, can reset password*** )
+ Chat Function
  + Online Chat ( ***Both on PC and Applet*** )
  + Media Resource ( ***Text, image, audio and video*** )
  + Look Through History ( ***Scroll up to refresh the latest 20 messages*** )
  + Security Check ( ***only text and image*** )
+ External Service
  + QR code of Beta version （Applet）
  + URL for visiting (Web)
+ Other Function
  + Show the number of users who have logged in
  + Allow users to share this mini-program ( ***Only homepage has this function*** )
  + Allow to look through the full image and download (Applet)
  + Allow users to copy text messages by long-time pressing (Applet)
------
### Visit Tutorial

------
### Known Bugs
1. The display of message will come back to the top if quitting the fullscreen of video in Applet side.
2. If you send a text message during the time you are looking through the chat history, it will not scroll down to the bottom. Probably you can refresh it by scrolling down manually or re-entering in Applet side.
3. Web side is only allowed to look through the chat records.
------
### License
+ [MIT License](https://github.com/KennardWang/WeChatMiniProgram-OnlineChatRoom/blob/master/LICENSE)
------
### Author
+ Kennard Wang ( 2020.8.21 )
------
