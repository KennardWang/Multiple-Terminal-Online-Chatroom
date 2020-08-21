
// reference: https://docs.cloudbase.net/api-reference/webv2/initialization.html

const app = cloudbase.init({
  env: "kennardwang-fzeuy"
});

const auth = app.auth();

// Anonymous Authorize
auth.anonymousAuthProvider()
.signIn()
.then(() => {
  console.log("anonymous login");
})
.catch((err) => {
  console.log("fail");
});

const db = app.database();
const cUser = db.collection("user");
const chat = db.collection("chatroom");


function sendEmail(){
  let em = document.getElementById("email").value; 
  let psd = document.getElementById("password").value; 

  alert("正在发送验证邮件，请稍后...")
  auth.signUpWithEmailAndPassword(em, psd).then(() => {
    alert("邮件发送成功！")
    cUser.add({
      email: em,
      password: psd
    }).then(()=>{
      alert("注册成功！")
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    })
  });
    
}

function emailLogin(){
  let em = document.getElementById("sEmail").value; 
  let psd = document.getElementById("sPass").value; 

  cUser.where({
    email: em,
    password: psd
  }).count().then(function(res){
    console.log(res.total);
    if(res.total == 1){
      alert("登录成功！")
      sendMsg();
    }
    else{
      alert("密码错误，登录失败");
      document.getElementById("sPass").value = "";
    }
    
  })

}

function resetPass(){
  let em = document.getElementById("rEmail").value; 
  let psd = document.getElementById("rPass").value; 
  let npsd = document.getElementById("newPass").value;
  let conpsd = document.getElementById("conPass").value;

  if(npsd == conpsd){
    
    cUser.where({
      email: em,
      password: psd
    }).count().then(function(res){
      if(res.total == 1){
        console.log("login successfully");
  
      cUser.where({
        email: em
      }).update({
        password: npsd
      }).then(()=>{
        alert("密码重置成功！");
        window.location.replace("http://kennardwang-fzeuy-1302835331.tcloudbaseapp.com/");
      })
    }
    else{
      alert("原密码不正确，请重新输入");
      document.getElementById("rPass").value = "";
    }
      
    })
    
  }
  else{
    alert("密码不一致，请重新输入");
    document.getElementById("newPass").value = "";
    document.getElementById("conPass").value = "";
  }
  
}

function  sendMsg(){

  let MSG = [];

  chat.where({}).watch({
    onChange: function (snapshot) {

      let temp = []; // temp file id
      let msg = '';
      let len = MSG.length;

      if(MSG.length == 0){
        MSG = snapshot.docs;
      }
      else{
        MSG.push(snapshot.docs[len])
      }
      len = MSG.length;

      // download the temp file
      for(var j = 0; j < len; ++j){

          let tmpid = "";

          switch(MSG[j].msgType){
            case "text":
              break;

            case "image":
              tmpid = MSG[j].imgFileID;
              temp.push(tmpid);
              break;

            case "video":
              tmpid = MSG[j].videoFileID;
              temp.push(tmpid);
              break;

            case "record":
              tmpid = MSG[j].recordFileID;
              temp.push(tmpid);
              break;

          }
      }

      let tempURL = [];

      app.getTempFileURL({
        fileList: temp
      })
    .then((res) => {
      for(var k = 0; k < res.fileList.length; ++k){
        tempURL.push(res.fileList[k].tempFileURL);
      }
    });
    

      // show up after 3 seconds
      setTimeout(function(){ 
        console.log(tempURL);
    
      let count = 0;

      for(var i = 0; i < len; ++i){

        let nickname = MSG[i].nickName;
        let avatar = MSG[i].avatar;

        switch(MSG[i].msgType){
          case "text":
              msg += '<tr><td><div class="msgblock"><label class="nickname">'+ nickname +'</label>' + '<img src="'+ avatar +
              '" alt="avatar" class="avatar"></div><div><label class="info">' + MSG[i].textContent + '</label></div></td></tr>';
              break;

          case "video":
              msg += '<tr><td><div class="msgblock"><label class="nickname">'+ nickname +'</label>' + '<img src="'+ avatar +
              '" alt="avatar" class="avatar"></div><div><video class="video" src="' + tempURL[count] + '" height="300px" controls></video></div></td></tr>';  
              count++;    
              break;

          case "image":
              msg += '<tr><td><div class="msgblock"><label class="nickname">'+ nickname +'</label>' + '<img src="'+ avatar +
              '" alt="avatar" class="avatar"></div><div><img class="image" src="'+ tempURL[count] + '" alt="image"></div></td></tr>';   
              count++;
              break;

          case "record":
              msg += '<tr><td><div class="msgblock"><label class="nickname">'+ nickname +'</label>' + '<img src="'+ avatar +
              '" alt="avatar" class="avatar"></div><div><audio class="record" src="' + tempURL[count] +'" controls></audio></div></td></tr>';
              count++;
              break;
        }
        
      }

      document.getElementById("main").innerHTML = '<img src="imgsrc/bg.png" alt="bg" class="bgimg">'+ '<table>' + msg + '</table>'
      }, 3000);
      
      
    },
    onError: function (err) {
      console.error("the watch closed because of error", err);
    }
  });

}


