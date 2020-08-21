# WeChatMiniProgram-OnlineChatRoom
### Demo
+ Applet  
<div style="display: flex; flex-direction: row; justify-content: space-around; align-content: center">
    <image src="https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/applet1.png" width="45%"></image>
    <image src="https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/applet2.png" width="45%"></image>
</div>  

+ Web
![web](https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/web2.png)  

![web](https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/web1.png)

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
  + QR code of Beta version （ ***Applet*** ）
  + URL for visiting ( ***Web*** )
+ Other Function
  + Show the number of users who have logged in
  + Allow users to share this mini-program ( ***Only homepage has this function*** )
  + Allow to look through the full image and download ( ***Applet*** )
  + Allow users to copy text messages by long-time pressing ( ***Applet*** )
------
### How to Visit ?
+ Applet
  1. Scan QR Code
  > ![QRcode](https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/chat.jpg)
  2. Apply for use, please write "Test" for reason!!
  3. I will give a permission for you, and just trying to scan QR code again, if it still doesn't, which means I am busy doing other tasks, please wait with patience.  
  4. If everything is OK, you will see a page like the second picture. Congratulations! You can start to chat now!

    <div style="display: flex; flex-direction: row; justify-content: space-around; align-content: center">
    <image src="https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/login1.png" width="45%"></image>
    <image src="https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/login2.png" width="45%"></image>
    </div> 
  
+ Web 
  1. Visit https://kennardwang-fzeuy-1302835331.tcloudbaseapp.com/
  2. Enrollment via Email ( ***Your password must be composed with English character and number, not less than 8 characters*** )
  > ![enroll](https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/login3.png)
  3. Verify through Link and Login with Email & Password ( ***Please use PC version of QQ mail*** )
  > ![enroll](https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/login4.jpg)
  
  > ![enroll](https://kennardwang.github.io/ImageSource/Project/WechatMiniProgram/login5.png)

------
### Credit
+ [Image Series](https://wallhaven.cc/w/39v996)
+ [SDK Document](https://www.cloudbase.net/sdk.html)
+ [API](https://developers.weixin.qq.com/miniprogram/dev/api/)
+ [Cloud Development](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
------
### Known Bugs
1. The display of message will come back to the top if quitting the fullscreen of video in Applet side.
2. Web side is only allowed to look through the chat records.
3. Both in Applet side and Web side, if you send a text message during the time you are looking through the chat history, it will not scroll down to the bottom. Probably you can refresh it by scrolling down manually or re-entering.
------
### License
+ [MIT License](https://github.com/KennardWang/WeChatMiniProgram-OnlineChatRoom/blob/master/LICENSE)
------
### Author
+ Kennard Wang ( 2020.8.21 )
------
