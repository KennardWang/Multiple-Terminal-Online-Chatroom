Page({

  data: {
    illust: [
    {
      name: 'cover1',
      image: "../../images/cover1.png"
    },
    {
      name: 'cover2',
      image: "../../images/cover2.png"
    },
    {
      name: 'cover3',
      image: "../../images/cover3.png"
    },
  ]
  },

  // check authorization
  onLoad(){

    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.userInfo']) {
          wx.authorize({
            scope: 'scope.userInfo',
          })
        
          // send login info to database
          const db = wx.cloud.database()
          db.collection('chatroom').doc('AuthNum').get({
            success: res=>{
              db.collection('chatroom').doc('AuthNum').update({
                data:{
                  value: res.data.value + 1
                }
              })  
            }    
          })
        }   
      }
    })
  },

  enterChat(res){
    if(res.detail.userInfo){
      wx.redirectTo({
        url: '../chatRoom/chatRoom'
      })
    }
  },

  onShareAppMessage(options) {
    console.log(options.webViewUrl)
    return {
      title: '嘘，我只想听你的呢喃声~',
      path: '/pages/startpage/startpage',
    }
  }
})