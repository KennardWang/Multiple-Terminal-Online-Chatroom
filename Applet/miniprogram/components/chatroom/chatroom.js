const FATAL_REBUILD_TOLERANCE = 10
const SETDATA_SCROLL_TO_BOTTOM = {
  scrollTop: 100000,
  scrollWithAnimation: true,
}
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();

Component({
  properties: {
    envId: String,
    collection: String,
    groupId: String,
    groupName: String,
    userInfo: Object,
    onGetUserInfo: {
      type: Function,
    },
    getOpenID: {
      type: Function,
    },
  },

  data: {
    chats: [],
    textInputValue: '',
    openId: '',
    scrollTop: 0,
    scrollToMessage: '',
    hasKeyboard: false,

    // modal options
    animationData: {},
    isHide: true,
  },

  methods: {
    onGetUserInfo(e) {
      this.properties.onGetUserInfo(e)
    },

    getOpenID() { 
      return this.properties.getOpenID() 
    },

    mergeCommonCriteria(criteria) {
      return {
        groupId: this.data.groupId,
        ...criteria,
      }
    },

    async initRoom() {
      this.try(async () => {
        await this.initOpenID()

        const { envId, collection } = this.properties
        const db = this.db = wx.cloud.database({
          env: envId,
        })
        const _ = db.command

        const { data: initList } = await db.collection(collection).where(this.mergeCommonCriteria()).orderBy('sendTimeTS', 'desc').get()

        this.setData({
          chats: initList.reverse(),
          scrollTop: 10000,
        })

        this.initWatch(initList.length ? {
          sendTimeTS: _.gt(initList[initList.length - 1].sendTimeTS),
        } : {})
      }, '初始化失败')

    },

    async initOpenID() {
      return this.try(async () => {
        const openId = await this.getOpenID()

        this.setData({
          openId,
        })
      }, '初始化 openId 失败')
    },

    async initWatch(criteria) {
      this.try(() => {
        const { collection } = this.properties
        const db = this.db
        const _ = db.command

        console.warn(`开始监听`, criteria)
        this.messageListener = db.collection(collection).where(this.mergeCommonCriteria(criteria)).watch({
          onChange: this.onRealtimeMessageSnapshot.bind(this),
          onError: e => {
            if (!this.inited || this.fatalRebuildCount >= FATAL_REBUILD_TOLERANCE) {
              this.showError(this.inited ? '监听错误，已断开' : '初始化监听失败', e, '重连', () => {
                this.initWatch(this.data.chats.length ? {
                  sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
                } : {})
              })
            } else {
              this.initWatch(this.data.chats.length ? {
                sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
              } : {})
            }
          },
        })
      }, '初始化监听失败')
    },

    onRealtimeMessageSnapshot(snapshot) {
      console.warn(`收到消息`, snapshot)

      if (snapshot.type === 'init') {
        this.setData({
          chats: [
            ...this.data.chats,
            ...[...snapshot.docs].sort((x, y) => x.sendTimeTS - y.sendTimeTS),
          ],
        })
        this.scrollToBottom()
        this.inited = true
      } else {
        let hasNewMessage = false
        let hasOthersMessage = false
        const chats = [...this.data.chats]
        for (const docChange of snapshot.docChanges) {
          switch (docChange.queueType) {
            case 'enqueue': {
              hasOthersMessage = docChange.doc._openid !== this.data.openId
              const ind = chats.findIndex(chat => chat._id === docChange.doc._id)
              if (ind > -1) {
                if (chats[ind].msgType === 'image' && chats[ind].tempFilePath) {
                  chats.splice(ind, 1, {
                    ...docChange.doc,
                    tempFilePath: chats[ind].tempFilePath,
                  })
                } else chats.splice(ind, 1, docChange.doc)
              } else {
                hasNewMessage = true
                chats.push(docChange.doc)
              }
              break
            }
          }
        }
        this.setData({
          chats: chats.sort((x, y) => x.sendTimeTS - y.sendTimeTS),
        })
        if (hasOthersMessage || hasNewMessage) {
          this.scrollToBottom()
        }
      }
    },

    // send message
    async onConfirmSendText(e) {
      this.try(async () => {
        if (!e.detail.value) {
          return
        }

        const { collection } = this.properties
        const db = this.db
        const _ = db.command

        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: this.data.groupId,
          avatar: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName,
          msgType: 'text',
          textContent: e.detail.value,
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback
        }

        this.setData({
          textInputValue: '',
          chats: [
            ...this.data.chats,
            {
              ...doc,
              _openid: this.data.openId,
              writeStatus: 'pending',
            },
          ],
        })
        this.scrollToBottom(true)
        
        // text security check
        wx.cloud.callFunction({
          name: "msgSecCheck",
          data: {
            value: e.detail.value
          }
        }).then(res => {
          if (res && res.result && res.result.errCode === 87014) {
              wx.showToast({
                  title: '您发送的文字涉嫌违规',
                  icon: 'none',
                  duration: 3000
              }) 
          }
          else {            
             console.log("内容安全");
          }
            }).catch(err => {
              wx.showToast({
                title: '未检测出异常',
                icon: 'none',
                duration: 1200
              }) 
          })
        
        await db.collection(collection).add({
          data: doc,
        })

        this.setData({
          chats: this.data.chats.map(chat => {
            if (chat._id === doc._id) {
              return {
                ...chat,
                writeStatus: 'written',
              }
            } else return chat
          }),
        })
      }, '发送文字失败')

    },

    async onChooseImage(e) {
      let that = this;
      wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: async res => {
              
          const { envId, collection } = this.properties
          const doc = {
            _id: `${Math.random()}_${Date.now()}`,
            groupId: this.data.groupId,
            avatar: this.data.userInfo.avatarUrl,
            nickName: this.data.userInfo.nickName,
            msgType: 'image',
            sendTime: new Date(),
            sendTimeTS: Date.now(), // fallback
          }

          this.setData({
            chats: [
              ...this.data.chats,
              {
                ...doc,
                _openid: this.data.openId,
                tempFilePath: res.tempFilePaths[0],
                writeStatus: 0,
              },
            ]
          })
          this.scrollToBottom(true)

          const uploadTask = wx.cloud.uploadFile({
            cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
            filePath: res.tempFilePaths[0],
            config: {
              env: envId,
            },
            success: res => {

              // image security check
              wx.cloud.callFunction({
                name: "imgSecCheck",
                data: {
                  value: res.data
                }
              }).then(res => {
                if (res && res.result && res.result.errCode === 87014) {
                    wx.showToast({
                        title: '您发送的图片内容涉嫌违规',
                        icon: 'none',
                        duration: 3000
                    })                
                }
                else {            
                    console.log("内容安全")
                }
              }).catch(err => {
                  wx.showToast({
                    title: '未检测出异常',
                    icon: 'none',
                    duration: 1200
                  })
                })
          
              this.try(async () => {
                await this.db.collection(collection).add({
                  data: {
                    ...doc,
                    imgFileID: res.fileID,
                  },
                })
              }, '发送图片失败')
            },
            fail: e => {
              this.showError('发送图片失败', e)
            },
          })

          uploadTask.onProgressUpdate(({ progress }) => {
            this.setData({
              chats: this.data.chats.map(chat => {
                if (chat._id === doc._id) {
                  return {
                    ...chat,
                    writeStatus: progress,
                  }
                } else return chat
              })
            })
          })
        },
      })

      // end the selection
      that.getOption();
    },

    async onChooseVideo(e) {
      let that = this;
      wx.chooseVideo({
        count: 1,
        sourceType: ['album', 'camera'],
        success: async res => {
          const { envId, collection } = this.properties
          const doc = {
            _id: `${Math.random()}_${Date.now()}`,
            groupId: this.data.groupId,
            avatar: this.data.userInfo.avatarUrl,
            nickName: this.data.userInfo.nickName,
            msgType: 'video',
            sendTime: new Date(),
            sendTimeTS: Date.now(), // fallback
          }

          this.setData({
            chats: [
              ...this.data.chats,
              {
                ...doc,
                _openid: this.data.openId,
                tempFilePath: res.tempFilePath,
                writeStatus: 0,
              },
            ]
          })
          this.scrollToBottom(true)
          
          const uploadTask = wx.cloud.uploadFile({
            cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePath.match(/\.(\w+)$/)[1]}`,
            filePath: res.tempFilePath,
            config: {
              env: envId,
            },
            success: res => {
              this.try(async () => {
                await this.db.collection(collection).add({
                  data: {
                    ...doc,
                    videoFileID: res.fileID,
                  },
                })
              }, '发送视频失败')
            },
            fail: e => {
              this.showError('发送视频失败', e)
            },
            
          })

          uploadTask.onProgressUpdate(({ progress }) => {
            this.setData({
              chats: this.data.chats.map(chat => {
                if (chat._id === doc._id) {
                  return {
                    ...chat,
                    writeStatus: progress,
                  }
                } else return chat
              })
            })
          })
        },
      })
      // end the selection
      that.getOption();
    },

    // record
    recordStart: function(){
        
        const options = {
        duration: 60000, //指定录音的时长，单位 ms
        sampleRate: 16000, //采样率
        numberOfChannels: 1, //录音通道数 
        encodeBitRate: 96000, //编码码率 
        format: 'mp3', //音频格式，有效值 aac/mp3
        frameSize: 50, //指定帧大小，单位 KB
        }
        recorderManager.start(options);
        
        recorderManager.onStart(() => {
          wx.showToast({
            title: '开始录音...',
            icon: 'none',
            duration: 1000
          })
        });

        //错误回调
        recorderManager.onError((res) => {
          console.log(res);
        })
    },

    recordStop: function() {
      recorderManager.stop();
      wx.showToast({
        title: '结束录音...',
        icon: 'none',
        duration: 1000
      })
      recorderManager.onStop((res) => {
        const { envId, collection } = this.properties
        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: this.data.groupId,
          avatar: this.data.userInfo.avatarUrl,
          nickName: this.data.userInfo.nickName,
          msgType: 'record',
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback  
        }

        this.setData({
          chats: [
            ...this.data.chats,
            {
              ...doc,
               _openid: this.data.openId,
              tempFilePath: res.tempFilePath,
              writeStatus: 0,
            },
          ]        
        })
        this.scrollToBottom(true)
          
        const uploadTask = wx.cloud.uploadFile({
        cloudPath: `${this.data.openId}/${Math.random()}_${Date.now()}.${res.tempFilePath.match(/\.(\w+)$/)[1]}`,
        filePath: res.tempFilePath,
        config: {
          env: envId,
        },
        success: res => {
          this.try(async () => {
            await this.db.collection(collection).add({
              data: {
                ...doc,
                recordFileID: res.fileID,
              },
            })
          }, '发送语音失败')
        },
        fail: e => {
          this.showError('发送语音失败', e)
        },         
      })

      uploadTask.onProgressUpdate(({ progress }) => {
        this.setData({
          chats: this.data.chats.map(chat => {
            if (chat._id === doc._id) {
              return {
                ...chat,
                writeStatus: progress,
              }
            } else return chat
          })
        })
      })         
    })
    },

    audioPlay: function(e) {

      wx.showToast({
        title: '正在播放录音',
        icon: 'none',
        duration: 500
      })

      console.log(e.currentTarget.dataset.fileid);
      innerAudioContext.src = e.currentTarget.dataset.fileid;
      innerAudioContext.play();
      
    },

    // scale up image
    onMessageImageTap(e) {
      wx.previewImage({
        urls: [e.target.dataset.fileid],
      })
    },

    scrollToBottom(force) {
      if (force) {
        this.setData(SETDATA_SCROLL_TO_BOTTOM)
        return
      }

      this.createSelectorQuery().select('.body').boundingClientRect(bodyRect => {
        this.createSelectorQuery().select(`.body`).scrollOffset(scroll => {
          if (scroll.scrollTop + bodyRect.height * 3 > scroll.scrollHeight) {
            this.setData(SETDATA_SCROLL_TO_BOTTOM)
          }
        }).exec()
      }).exec()
    },

    async onScrollToUpper() {
      if (this.db && this.data.chats.length) {
        const { collection } = this.properties
        const _ = this.db.command
        const { data } = await this.db.collection(collection).where(this.mergeCommonCriteria({
          sendTimeTS: _.lt(this.data.chats[0].sendTimeTS),
        })).orderBy('sendTimeTS', 'desc').get()
        this.data.chats.unshift(...data.reverse())
        this.setData({
          chats: this.data.chats,
          scrollToMessage: `item-${data.length}`,
          scrollWithAnimation: false,
        })
      }
    },

    async try(fn, title) {
      try {
        await fn()
      } catch (e) {
        this.showError(title, e)
      }
    },

    showError(title, content, confirmText, confirmCallback) {
      console.error(title, content)
      wx.showModal({
        title,
        content: content.toString(),
        showCancel: confirmText ? true : false,
        confirmText,
        success: res => {
          res.confirm && confirmCallback()
        },
      })
    },

    // modal 
    getOption: function(){
    var that = this;
    that.setData({
      isHide: true
    })

    // send image
    if(this.data.value == "图片"){
      console.log("yes");
      
    }
   
    },
  
    getCancel: function () {
      var that = this;
      that.hideModal();
    },

    showModal: function(){
      let that = this;
      that.setData({
        isHide: false
      })

    // create animation
    let animation = wx.createAnimation({
      delay: 0,
      duration: 200,
      timingFunction: "linear"
    })
    this.animation = animation;
    setTimeout(function(){
      that.fadeIn();
    }, 200)
    },

    hideModal: function(){
      let that = this;
      let animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease'
      })
      this.animation = animation
      that.fadeDown();
      setTimeout(function(){
        that.setData({
          isHide: true
        })
      }, 300)
    },

    // animation
    fadeIn: function(){
      this.animation.translateY(0).step()
      this.setData({
        animationData: this.animation.export(),
      })
    },

    fadeDown: function(){
      this.animation.translateY(300).step()
      this.setData({
        animationData: this.animation.export(),
      })
    },

  },

  ready() {
    global.chatroom = this
    this.initRoom()
    this.fatalRebuildCount = 0
  },

})
